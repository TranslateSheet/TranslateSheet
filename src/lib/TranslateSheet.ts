import { TOptions } from "i18next";
import languageChangeEmitter from "./utils/languageChangeEmitter";
import validateInterpolatedKeys from "../lib/utils/validateInterpolatedKeys";

import i18nJsAdapter from "../adapters/i18n-js-adapter";
import i18nextAdapter from "../adapters/i18next-adapter";
import { LocalizationAdapter, PredefinedAdapters } from "../types";
import { TranslateSheetConfig } from "../types";

// Recursive type transformation for nested translations
type Translated<T> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : Translated<T[K]>
    : string &
        ((
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => string);
};

const primaryLanguage = "en";

// Recursive helper function to process translations
function processTranslations(
  namespace: string,
  translations: any,
  keyPrefix: string = "",
  cachedValues: Map<string, string>,
  adapter: LocalizationAdapter,
  currentLanguage: string
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

          if (currentLanguage === primaryLanguage) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => options?.[p1] ?? `{{ ${p1} }}`
            );
          }

          return adapter.translate(`${namespace}:${fullKey}`, {
            ...options,
            ...additionalOptions,
            defaultValue: value,
          });
        };
      } else {
        // Define a getter for static strings
        Object.defineProperty(processed, key, {
          get: () => {
            if (currentLanguage === primaryLanguage) {
              return value;
            }
            if (cachedValues.has(fullKey)) {
              return cachedValues.get(fullKey)!;
            }
            const translatedValue = adapter.translate(
              `${namespace}:${fullKey}`,
              {
                defaultValue: value,
              }
            );
            cachedValues.set(fullKey, translatedValue);
            return translatedValue;
          },
        });
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively process nested objects
      processed[key] = processTranslations(
        namespace,
        value,
        fullKey,
        cachedValues,
        adapter,
        currentLanguage
      );
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

let adapter: LocalizationAdapter | null = null;
let config: TranslateSheetConfig | null = null;

const predefinedAdapters: Record<PredefinedAdapters, LocalizationAdapter> = {
  i18next: i18nextAdapter,
  "i18n-js": i18nJsAdapter,
};

const defaultConfig: TranslateSheetConfig = {
  primaryLanguage: "en",
  fileExtension: ".ts",
  languages: [],
  apiKey: "",
  output: "",
  generatePrimaryLanguageFile: false,
};

const TranslateSheet = {
  init: (options: TranslateSheetConfig) => {
    const { adapter: adapterOption, ...rest } = options;

    // Handle predefined adapters
    if (typeof adapterOption === "string") {
      if (!(adapterOption in predefinedAdapters)) {
        throw new Error(
          `[TranslateSheet] Unsupported adapter: ${adapterOption}`
        );
      }
      adapter = predefinedAdapters[adapterOption]; // Directly use the adapter instance
    } else if (typeof adapterOption === "object") {
      adapter = adapterOption;
    } else {
      throw new Error("[TranslateSheet] Invalid adapter provided.");
    }

    config = { ...defaultConfig, ...rest };

    console.log("[TranslateSheet] Initialized with config:", config);
  },
  create<T extends Record<string, any>>(
    namespace: string,
    translations: T
  ): Translated<T> {
    if (!adapter) {
      throw new Error(
        "TranslateSheet has not been initialized. Call `TranslateSheet.init()` with a valid adapter."
      );
    }

    if (!config) {
      throw new Error("No TranslateSheet config found");
    }

    const cachedValues = new Map<string, string>();

    let currentLanguage = adapter.getLanguage();

    adapter.onLanguageChange(() => {
      currentLanguage = adapter!.getLanguage();
      cachedValues.clear();
    });

    return processTranslations(
      namespace,
      translations,
      "",
      cachedValues,
      adapter,
      currentLanguage
    ) as Translated<T>;
  },
};

export default TranslateSheet;
