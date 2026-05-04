import i18n, { TOptions } from "i18next";
import useLanguageChange from "../lib/hooks/useLanguageChange";
import languageChangeEmitter from "./utils/languageChangeEmitter";
import validateInterpolatedKeys from "../lib/utils/validateInterpolatedKeys";

// Trim leading/trailing whitespace at the type level.
type Trim<S extends string> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer R} `
    ? Trim<R>
    : S;

// `{{name, format}}` is valid i18next syntax — only the part before the comma
// is the variable name. Everything after is the format spec.
type InterpolationKeyName<Raw extends string> = Raw extends `${infer Before},${string}`
  ? Trim<Before>
  : Trim<Raw>;

// Walk a string literal type and pull out every `{{...}}` placeholder name as
// a string union. Non-literal `string` falls through to `never`, so the
// downstream conditional reverts to a plain `string` leaf.
type ExtractInterpolationKeys<S extends string> =
  S extends `${string}{{${infer Key}}}${infer Rest}`
    ? InterpolationKeyName<Key> | ExtractInterpolationKeys<Rest>
    : never;

type InterpolationOptions<S extends string> = {
  [K in ExtractInterpolationKeys<S>]: string | number;
};

// Leaves with no `{{...}}` are exposed as plain strings (the runtime backs
// them with a getter). Leaves with placeholders are exposed as a callable
// whose first argument is keyed exactly to the placeholder names — passing an
// unknown key (e.g. `{blah: ...}` when the template has `{{name}}`) is a
// compile error. Extra i18next options (count, context, etc.) go through the
// optional second argument.
type TranslationLeaf<S extends string> =
  [ExtractInterpolationKeys<S>] extends [never]
    ? string
    : (
        options: InterpolationOptions<S>,
        additionalOptions?: TOptions
      ) => string;

// Recursive type transformation for nested translations
type Translated<T> = {
  [K in keyof T]: T[K] extends string
    ? TranslationLeaf<T[K]>
    : T[K] extends object
      ? Translated<T[K]>
      : T[K];
};

let globalI18nInitialized = false;
i18n.on("initialized", () => {
  globalI18nInitialized = true;
});

const primaryLanguage = "en";

// Single shared cache for all namespaces, keyed by `${namespace}:${fullKey}`.
// Held at module scope so we register exactly one i18n languageChanged listener
// regardless of how many times TranslateSheet.create() is called.
const cachedValues = new Map<string, string>();

i18n.on("languageChanged", () => {
  cachedValues.clear();
  languageChangeEmitter.emit();
});

// Recursive helper function to process translations
function processTranslations(
  namespace: string,
  translations: any,
  keyPrefix: string = ""
): any {
  const processed: Record<string, any> = {};

  Object.keys(translations).forEach((key) => {
    // Build full key path for nested objects (e.g. "accessibility.cardHint")
    const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;
    const cacheKey = `${namespace}:${fullKey}`;
    const value = translations[key];

    if (typeof value === "string") {
      if (value.includes("{{")) {
        processed[key] = (
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => {

          // Validate interpolations
          if (options) {
            validateInterpolatedKeys(value, options);
          } else {
            console.warn(
              `[TranslateSheet] Missing interpolated values for key: "${namespace}:${fullKey}". Expected keys: ${
                value
                  .match(/\{\{(.*?)\}\}/g)
                  ?.map((k) => k.replace(/{{|}}/g, ""))
                  .join(", ") || "none"
              }.`
            );
          }

          if (
            !globalI18nInitialized ||
            i18n?.language?.includes(primaryLanguage)
          ) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => options?.[p1] ?? `{{ ${p1} }}`
            );
          }

          return i18n.t(cacheKey, {
            ...options,
            ...additionalOptions,
            defaultValue: value,
          });
        };
      } else {
        // Define a getter for static strings
        Object.defineProperty(processed, key, {
          get: () => {

            if (
              !globalI18nInitialized ||
              i18n?.language?.includes(primaryLanguage)
            ) {
              return value;
            }
            if (cachedValues.has(cacheKey)) {
              return cachedValues.get(cacheKey)!;
            }
            const translatedValue = i18n.t(cacheKey, {
              defaultValue: value,
            });
            cachedValues.set(cacheKey, translatedValue);
            return translatedValue;
          },
        });
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively process nested objects
      processed[key] = processTranslations(namespace, value, fullKey);
    } else {
      processed[key] = value;
    }
  });

  return new Proxy(processed, {
    get(target, key: string) {
      const value = target[key];
      return typeof value === "function"
        ? (...args: any[]) => value(...args)
        : value;
    },
  });
}

const TranslateSheet = {
  // `const T` (TS 5.0+) preserves the literal string types of every leaf in
  // `translations`. Without it, `"Hello, {{name}}"` would widen to `string`,
  // which makes ExtractInterpolationKeys collapse to `never` and you lose the
  // typed-options ergonomic the rest of this file is built for.
  create<const T extends Record<string, any>>(
    namespace: string,
    translations: T
  ): Translated<T> {
    return processTranslations(namespace, translations) as Translated<T>;
  },
};

export default TranslateSheet;
