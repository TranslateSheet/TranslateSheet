import i18n, { TOptions } from "i18next";
import useLanguageChange from "../lib/hooks/useLanguageChange";
import languageChangeEmitter from "./utils/languageChangeEmitter";
import validateInterpolatedKeys from "../lib/utils/validateInterpolatedKeys";

// Recursive type transformation for nested translations
type Translated<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : Translated<T[K]>
    : string & ((options?: Record<string, any>, additionalOptions?: TOptions) => string);
};


let globalI18nInitialized = false;
i18n.on("initialized", () => {
  globalI18nInitialized = true;
});

const primaryLanguage = "en";

// Recursive helper function to process translations
function processTranslations(
  namespace: string,
  translations: any,
  keyPrefix: string = "",
  cachedValues: Map<string, string>
): any {
  const processed: Record<string, any> = {};

  Object.keys(translations).forEach((key) => {
    // Build full key path for nested objects (e.g. "accessibility.cardHint")
    const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;
    const value = translations[key];

    if (typeof value === "string") {
      if (value.includes("{{")) {
        processed[key] = (
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => {
          // Force re-render on language change in React components
          useLanguageChange();

          // Validate interpolations
          if (options) {
            validateInterpolatedKeys(value, options);
          } else {
            console.warn(
              `[TranslateSheet] Missing interpolated values for key: "${namespace}:${fullKey}". Expected keys: ${
                value.match(/\{\{(.*?)\}\}/g)?.map((k) => k.replace(/{{|}}/g, "")).join(", ") || "none"
              }.`
            );
          }

          if (!globalI18nInitialized || i18n?.language?.includes(primaryLanguage)) {
            return value.replace(/\{\{(.*?)\}\}/g, (_, p1) => options?.[p1] ?? `{{ ${p1} }}`);
          }

          return i18n.t(`${namespace}:${fullKey}`, {
            ...options,
            ...additionalOptions,
            defaultValue: value,
          });
        };
      } else {
        // Define a getter for static strings
        Object.defineProperty(processed, key, {
          get: () => {
            useLanguageChange();

            if (!globalI18nInitialized || i18n?.language?.includes(primaryLanguage)) {
              return value;
            }
            if (cachedValues.has(fullKey)) {
              return cachedValues.get(fullKey)!;
            }
            const translatedValue = i18n.t(`${namespace}:${fullKey}`, {
              defaultValue: value,
            });
            cachedValues.set(fullKey, translatedValue);
            return translatedValue;
          },
        });
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively process nested objects
      processed[key] = processTranslations(namespace, value, fullKey, cachedValues);
    } else {
      processed[key] = value;
    }
  });

  return new Proxy(processed, {
    get(target, key: string) {
      const value = target[key];
      return typeof value === "function" ? (...args: any[]) => value(...args) : value;
    },
  });
}

const TranslateSheet = {
  create<T extends Record<string, any>>(
    namespace: string,
    translations: T
  ): Translated<T> {
    const cachedValues = new Map<string, string>();

    // Clear cache on language change
    i18n.on("languageChanged", () => {
      cachedValues.clear();
      languageChangeEmitter.emit();
    });

    return processTranslations(namespace, translations, "", cachedValues) as Translated<T>;
  },
};

export default TranslateSheet;
