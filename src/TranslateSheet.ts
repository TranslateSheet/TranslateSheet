import i18n, { TOptions } from "i18next";

const TranslateSheet = {
  create<T extends Record<string, string | ((...args: any[]) => string)>>(
    namespace: string,
    translations: T
  ) {

    //TODO: fs and path inside of loadConfig are holding back dynamic primary languages
    const primaryLanguage = "en";

    const processedTranslations: Record<string, any> = {};

    Object.keys(translations).forEach((key) => {
      const value = translations[key];

      // Cache for static translations
      let cachedValue: string | null = null;

      if (typeof value === "string" && value.includes("{{")) {
        // Handle interpolated strings
        processedTranslations[key] = (
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => {
          if (i18n?.language?.includes(primaryLanguage)) {
            // Directly replace placeholders for primary language
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => options?.[p1] ?? `{{ ${p1} }}`
            );
          }

          if (!i18n.isInitialized) {
            console.warn(
              `[TranslateSheet] i18n not initialized for key: ${namespace}:${key}`
            );
            return value; // Fallback to raw string
          }

          return i18n.t(`${namespace}:${key}`, {
            ...options,
            ...additionalOptions, // Pass additional options like format
            defaultValue: value, // Fallback to the local value
          });
        };
      } else if (typeof value === "string") {
        // Handle static strings with caching
        Object.defineProperty(processedTranslations, key, {
          get: () => {
            if (i18n?.language?.includes(primaryLanguage)) {
              return value; // Directly return local value for primary language
            }

            if (cachedValue !== null) {
              return cachedValue; // Return cached value if available
            }

            if (!i18n.isInitialized) {
              // Suppress warning if local value can be returned
              console.warn(
                `[TranslateSheet] i18n not initialized for key: ${namespace}:${key}`
              );
              return value; // Fallback to raw string without caching
            }

            cachedValue = i18n.t(`${namespace}:${key}`, {
              defaultValue: value,
            });
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
