"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => TranslateSheet_default
});
module.exports = __toCommonJS(index_exports);

// src/TranslateSheet.ts
var import_i18next = __toESM(require("i18next"));
var TranslateSheet = {
  create(namespace, translations) {
    let i18nInitialized = false;
    let warnedAboutInitializationDelay = false;
    import_i18next.default.on("initialized", () => {
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
          if ((_b = (_a = import_i18next.default) == null ? void 0 : _a.language) == null ? void 0 : _b.includes(primaryLanguage)) {
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
          const result = import_i18next.default.t(`${namespace}:${key}`, __spreadProps(__spreadValues(__spreadValues({}, options), additionalOptions), {
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
            if ((_b = (_a = import_i18next.default) == null ? void 0 : _a.language) == null ? void 0 : _b.includes(primaryLanguage)) {
              return value;
            }
            if (cachedValue !== null) {
              return cachedValue;
            }
            if (!i18nInitialized) {
              return value;
            }
            cachedValue = import_i18next.default.t(`${namespace}:${key}`, {
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
