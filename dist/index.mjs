var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// src/TranslateSheet.ts
import i18n from "i18next";
var TranslateSheet = {
  create(namespace, translations) {
    let i18nInitialized = false;
    let warnedAboutInitializationDelay = false;
    i18n.on("initialized", () => {
      i18nInitialized = true;
    });
    setTimeout(() => {
      if (!i18nInitialized && !warnedAboutInitializationDelay) {
        console.warn(
          `[TranslateSheet] i18n not initialized after 500ms. Ensure that initI18n is called before using translations.`
        );
        warnedAboutInitializationDelay = true;
      }
    }, 500);
    const primaryLanguage = "en";
    const processedTranslations = {};
    Object.keys(translations).forEach((key) => {
      const value = translations[key];
      let cachedValue = null;
      if (typeof value === "string" && value.includes("{{")) {
        processedTranslations[key] = (options, additionalOptions) => {
          var _a, _b;
          if ((_b = (_a = i18n) == null ? void 0 : _a.language) == null ? void 0 : _b.includes(primaryLanguage)) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => {
                var _a2;
                return (_a2 = options == null ? void 0 : options[p1]) != null ? _a2 : `{{ ${p1} }}`;
              }
            );
          }
          if (!i18nInitialized) {
            return value;
          }
          const result = i18n.t(`${namespace}:${key}`, __spreadProps(__spreadValues(__spreadValues({}, options), additionalOptions), {
            defaultValue: value
          }));
          if (result === key) {
            console.warn(`[TranslateSheet] Missing translation for key: ${namespace}:${key}`);
          }
          return result;
        };
      } else if (typeof value === "string") {
        Object.defineProperty(processedTranslations, key, {
          get: () => {
            var _a, _b;
            if ((_b = (_a = i18n) == null ? void 0 : _a.language) == null ? void 0 : _b.includes(primaryLanguage)) {
              return value;
            }
            if (cachedValue !== null) {
              return cachedValue;
            }
            if (!i18nInitialized) {
              return value;
            }
            cachedValue = i18n.t(`${namespace}:${key}`, {
              defaultValue: value
            });
            if (cachedValue === key) {
              console.warn(`[TranslateSheet] Missing translation for key: ${namespace}:${key}`);
            }
            return cachedValue;
          }
        });
      } else {
        processedTranslations[key] = value;
      }
    });
    return new Proxy(processedTranslations, {
      get(target, key) {
        const value = target[key];
        if (typeof value === "function") {
          return (...args) => value(...args);
        }
        return value;
      }
    });
  }
};
var TranslateSheet_default = TranslateSheet;
export {
  TranslateSheet_default as default
};
