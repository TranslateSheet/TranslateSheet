  import { LocalizationAdapter, PredefinedAdapters, TranslateSheetConfig } from "./types";
  import i18nJsAdapter from "./adapters/i18n-js-adapter";
  import i18nextAdapter from "./adapters/i18next-adapter";
  import { TOptions } from "i18next";

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

    create<T extends Record<string, string | ((...args: any[]) => string)>>(
      namespace: string,
      translations: T
    ) {
      if (!adapter) {
        throw new Error(
          "TranslateSheet has not been initialized. Call `TranslateSheet.init()` with a valid adapter."
        );
      }

      if (!config) {
        throw new Error("No TranslateSheet config found");
      }

      const processedTranslations: Record<string, any> = {};
      const currentLanguage = adapter.getLanguage(); // Cache current language

      Object.keys(translations).forEach((key) => {
        const value = translations[key];

        // Cache for static translations
        let cachedValue: string | null = null;

        if (typeof value === "string" && value.includes("{{")) {
          // Handle interpolated strings
          processedTranslations[key] = (options?: Record<string, any>) => {
            if (currentLanguage === config?.primaryLanguage) {
              // Directly replace placeholders for primary language
              return value.replace(
                /\{\{(.*?)\}\}/g,
                (_, p1) => options?.[p1] ?? `{{ ${p1} }}`
              );
            }

            return adapter?.translate(`${namespace}:${key}`, options);
          };
        } else if (typeof value === "string") {
          // Handle static strings with caching
          Object.defineProperty(processedTranslations, key, {
            get: () => {
              if (currentLanguage === config?.primaryLanguage) {
                return value; // Directly return local value for primary language
              }

              if (cachedValue !== null) {
                return cachedValue; // Return cached value if available
              }

              cachedValue = adapter?.translate(`${namespace}:${key}`);
              return cachedValue;
            },
          });
        } else {
          // Directly assign if it's a function
          processedTranslations[key] = value;
        }
      });

      return new Proxy(processedTranslations, {
        get(target, key: string) {
          const value = target[key];
          if (typeof value === "function") {
            return (...args: any[]) => value(...args);
          }
          return value;
        },
      }) as {
        [K in keyof T]: T[K] extends (...args: any[]) => any
          ? T[K]
          : string &
              ((
                options?: Record<string, any>,
                additionalOptions?: TOptions
              ) => string);
      };
    },
  };

  export default TranslateSheet;
