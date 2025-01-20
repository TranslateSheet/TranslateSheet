import i18n, { TOptions } from "i18next";
import useLanguageChange from "../lib/hooks/useLanguageChange";
import languageChangeEmitter from "./languageChangeEmitter";
import validateInterpolatedKeys from "../lib/utils/validateInterpolatedKeys";

let globalI18nInitialized = false;

i18n.on("initialized", () => {
  globalI18nInitialized = true;
});

const TranslateSheet = {
  create<T extends Record<string, string | ((...args: any[]) => string)>>(
    namespace: string,
    translations: T
  ): {
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? T[K]
      : string &
          ((
            options?: Record<string, any>,
            additionalOptions?: TOptions
          ) => string);
  } {
    const primaryLanguage = "en";
    const processedTranslations: Record<string, any> = {};
    const cachedValues = new Map<string, string>();

    // Clear cache on language change
    i18n.on("languageChanged", () => {
      cachedValues.clear();
      languageChangeEmitter.emit();
    });

    Object.keys(translations).forEach((key) => {
      const value = translations[key];

      if (typeof value === "string" && value.includes("{{")) {
        processedTranslations[key] = (
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => {
          useLanguageChange();

          // Validate interpolations
          if (options) {
            validateInterpolatedKeys(value, options);
          } else {
            console.warn(
              `[TranslateSheet] Missing interpolated values for key: "${namespace}:${key}". Expected keys: ${
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

          return i18n.t(`${namespace}:${key}`, {
            ...options,
            ...additionalOptions,
            defaultValue: value,
          });
        };
      } else if (typeof value === "string") {
        Object.defineProperty(processedTranslations, key, {
          get: () => {
            useLanguageChange();

            if (
              !globalI18nInitialized ||
              i18n?.language?.includes(primaryLanguage)
            ) {
              return value;
            }

            if (cachedValues.has(key)) {
              return cachedValues.get(key)!;
            }

            const translatedValue = i18n.t(`${namespace}:${key}`, {
              defaultValue: value,
            });

            cachedValues.set(key, translatedValue);
            return translatedValue;
          },
        });
      } else {
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
