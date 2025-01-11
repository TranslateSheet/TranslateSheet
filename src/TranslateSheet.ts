import i18n, { TOptions } from "i18next";

const TranslateSheet = {
  create<T extends Record<string, string | ((...args: any[]) => string)>>(
    namespace: string,
    translations: T
  ) {
    let i18nInitialized = false;
    let warnedAboutInitializationDelay = false;

    // Listen for i18next initialization and set the flag
    i18n.on("initialized", () => {
      i18nInitialized = true;
    });

    // Warn if i18n is not initialized after a significant delay (500ms)
    setTimeout(() => {
      if (!i18nInitialized && !warnedAboutInitializationDelay) {
        console.warn(
          `[TranslateSheet] i18n not initialized after 500ms. Ensure that initI18n is called before using translations.`
        );
        warnedAboutInitializationDelay = true;
      }
    }, 500);

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
          // DEV mode: Directly return local value for primary language
          if (i18n.language.includes(primaryLanguage)) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => options?.[p1] ?? `{{ ${p1} }}`
            );
          }

          if (!i18nInitialized) {
            return value; // Suppress warning during startup
          }

          const result = i18n.t(`${namespace}:${key}`, {
            ...options,
            ...additionalOptions,
            defaultValue: value,
          });

          // Log warning if translation is missing
          if (result === key) {
            console.warn(`[TranslateSheet] Missing translation for key: ${namespace}:${key}`);
          }

          return result;
        };
      } else if (typeof value === "string") {
        // Handle static strings with caching
        Object.defineProperty(processedTranslations, key, {
          get: () => {
            // DEV mode: Directly return local value for primary language
            if (i18n.language.includes(primaryLanguage)) {
              return value;
            }

            if (cachedValue !== null) {
              return cachedValue;
            }

            if (!i18nInitialized) {
              return value; // Suppress warning during startup
            }

            cachedValue = i18n.t(`${namespace}:${key}`, {
              defaultValue: value,
            });

            // Log warning if translation is missing
            if (cachedValue === key) {
              console.warn(`[TranslateSheet] Missing translation for key: ${namespace}:${key}`);
            }

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
