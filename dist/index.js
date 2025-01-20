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

// src/lib/TranslateSheet.ts
var import_i18next = __toESM(require("i18next"));

// src/lib/hooks/useLanguageChange.ts
var import_react = require("react");

// src/lib/languageChangeEmitter.ts
var languageChangeEmitter = {
  listeners: /* @__PURE__ */ new Set(),
  emit() {
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      return void 0;
    };
  }
};
var languageChangeEmitter_default = languageChangeEmitter;

// src/lib/hooks/useLanguageChange.ts
var useLanguageChange = () => {
  const [, setLangChange] = (0, import_react.useState)(0);
  (0, import_react.useEffect)(() => {
    return languageChangeEmitter_default.subscribe(() => {
      setLangChange((prev) => prev + 1);
    });
  }, []);
};
var useLanguageChange_default = useLanguageChange;

// src/lib/utils/extractInterpolationKeys.ts
var extractInterpolationKeys = (str) => {
  const matches = str.match(/\{\{(.*?)\}\}/g) || [];
  return matches.map((m) => m.slice(2, -2).trim());
};
var extractInterpolationKeys_default = extractInterpolationKeys;

// src/lib/utils/validateInterpolatedKeys.ts
var validateInterpolatedKeys = (template, options) => {
  const requiredKeys = extractInterpolationKeys_default(template);
  const providedKeys = Object.keys(options);
  const invalidKeys = providedKeys.filter((key) => !requiredKeys.includes(key));
  const missingKeys = requiredKeys.filter((key) => !providedKeys.includes(key));
  if (invalidKeys.length > 0 || missingKeys.length > 0) {
    console.warn(
      `[TranslateSheet] Invalid interpolation parameters.
` + (invalidKeys.length ? `Unexpected keys: ${invalidKeys.join(", ")}
` : "") + (missingKeys.length ? `Missing required keys: ${missingKeys.join(", ")}` : "")
    );
  }
};
var validateInterpolatedKeys_default = validateInterpolatedKeys;

// src/lib/TranslateSheet.ts
var globalI18nInitialized = false;
import_i18next.default.on("initialized", () => {
  globalI18nInitialized = true;
});
var TranslateSheet = {
  create(namespace, translations) {
    const primaryLanguage = "en";
    const processedTranslations = {};
    const cachedValues = /* @__PURE__ */ new Map();
    import_i18next.default.on("languageChanged", () => {
      cachedValues.clear();
      languageChangeEmitter_default.emit();
    });
    Object.keys(translations).forEach((key) => {
      const value = translations[key];
      if (typeof value === "string" && value.includes("{{")) {
        processedTranslations[key] = (options, additionalOptions) => {
          var _a, _b, _c;
          useLanguageChange_default();
          if (options) {
            validateInterpolatedKeys_default(value, options);
          } else {
            console.warn(
              `[TranslateSheet] Missing interpolated values for key: "${namespace}:${key}". Expected keys: ${((_a = value.match(/\{\{(.*?)\}\}/g)) == null ? void 0 : _a.map((k) => k.replace(/{{|}}/g, "")).join(", ")) || "none"}.`
            );
          }
          if (!globalI18nInitialized || ((_c = (_b = import_i18next.default) == null ? void 0 : _b.language) == null ? void 0 : _c.includes(primaryLanguage))) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => {
                var _a2;
                return (_a2 = options == null ? void 0 : options[p1]) != null ? _a2 : `{{ ${p1} }}`;
              }
            );
          }
          return import_i18next.default.t(`${namespace}:${key}`, __spreadProps(__spreadValues(__spreadValues({}, options), additionalOptions), {
            defaultValue: value
          }));
        };
      } else if (typeof value === "string") {
        Object.defineProperty(processedTranslations, key, {
          get: () => {
            var _a, _b;
            useLanguageChange_default();
            if (!globalI18nInitialized || ((_b = (_a = import_i18next.default) == null ? void 0 : _a.language) == null ? void 0 : _b.includes(primaryLanguage))) {
              return value;
            }
            if (cachedValues.has(key)) {
              return cachedValues.get(key);
            }
            const translatedValue = import_i18next.default.t(`${namespace}:${key}`, {
              defaultValue: value
            });
            cachedValues.set(key, translatedValue);
            return translatedValue;
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
