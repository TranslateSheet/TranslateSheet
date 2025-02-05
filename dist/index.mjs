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

// src/lib/TranslateSheet.ts
import i18n from "i18next";

// src/lib/hooks/useLanguageChange.ts
import { useState, useEffect } from "react";

// src/lib/utils/languageChangeEmitter.ts
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
  const [, setLangChange] = useState(0);
  useEffect(() => {
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
i18n.on("initialized", () => {
  globalI18nInitialized = true;
});
var TranslateSheet = {
  create(namespace, translations) {
    const primaryLanguage = "en";
    const processedTranslations = {};
    const cachedValues = /* @__PURE__ */ new Map();
    i18n.on("languageChanged", () => {
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
          if (!globalI18nInitialized || ((_c = (_b = i18n) == null ? void 0 : _b.language) == null ? void 0 : _c.includes(primaryLanguage))) {
            return value.replace(
              /\{\{(.*?)\}\}/g,
              (_, p1) => {
                var _a2;
                return (_a2 = options == null ? void 0 : options[p1]) != null ? _a2 : `{{ ${p1} }}`;
              }
            );
          }
          return i18n.t(`${namespace}:${key}`, __spreadProps(__spreadValues(__spreadValues({}, options), additionalOptions), {
            defaultValue: value
          }));
        };
      } else if (typeof value === "string") {
        Object.defineProperty(processedTranslations, key, {
          get: () => {
            var _a, _b;
            useLanguageChange_default();
            if (!globalI18nInitialized || ((_b = (_a = i18n) == null ? void 0 : _a.language) == null ? void 0 : _b.includes(primaryLanguage))) {
              return value;
            }
            if (cachedValues.has(key)) {
              return cachedValues.get(key);
            }
            const translatedValue = i18n.t(`${namespace}:${key}`, {
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
export {
  TranslateSheet_default as default
};
