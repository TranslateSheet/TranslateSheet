import i18n, { TOptions } from "i18next";
import useLanguageChange from "../lib/hooks/useLanguageChange"
import languageChangeEmitter from "./languageChangeEmitter";
import validateInterpolatedKeys from "../lib/utils/validateInterpolatedKeys"

const TranslateSheet = {
  create<T extends Record<string, string | ((...args: any[]) => string)>>(
    namespace: string,
    translations: T
  ): {
    [K in keyof T]: T[K] extends (...args: any[]) => any
      ? T[K]
      : string & ((
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => string);
  } {
    let i18nInitialized = false;

    i18n.on("initialized", () => {
      i18nInitialized = true;
    });

    i18n.on("languageChanged", () => {
      cachedValues.clear();
      languageChangeEmitter.emit();
    });

    const primaryLanguage = "en";
    const processedTranslations: Record<string, any> = {};
    const cachedValues = new Map<string, string>();

    Object.keys(translations).forEach((key) => {
      const value = translations[key];

      if (typeof value === "string" && value.includes("{{")) {
        processedTranslations[key] = (
          options?: Record<string, any>,
          additionalOptions?: TOptions
        ) => {
          useLanguageChange();
          if (options) validateInterpolatedKeys(value, options);

          if (i18n.language.includes(primaryLanguage)) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => options?.[p1] ?? `{{ ${p1} }}`
            );
          }

          if (!i18nInitialized) {
            return value;
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

            if (i18n.language.includes(primaryLanguage)) {
              return value;
            }

            if (cachedValues.has(key)) {
              return cachedValues.get(key)!;
            }

            if (!i18nInitialized) {
              return value;
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