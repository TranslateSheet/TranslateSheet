"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const TranslateSheet = {
    create(namespace, translations) {
        // fs and path inside of loadConfig are holding back dynamic primary languages
        const primaryLanguage = "en";
        const processedTranslations = {};
        Object.keys(translations).forEach((key) => {
            const value = translations[key];
            // Cache for static translations
            let cachedValue = null;
            if (typeof value === "string" && value.includes("{{")) {
                // Handle interpolated strings
                processedTranslations[key] = (options, additionalOptions) => {
                    var _a;
                    if ((_a = i18next_1.default === null || i18next_1.default === void 0 ? void 0 : i18next_1.default.language) === null || _a === void 0 ? void 0 : _a.includes(primaryLanguage)) {
                        // Directly replace placeholders for primary language
                        return value.replace(/\{\{(.*?)\}\}/g, (_, p1) => { var _a; return (_a = options === null || options === void 0 ? void 0 : options[p1]) !== null && _a !== void 0 ? _a : `{{ ${p1} }}`; });
                    }
                    if (!i18next_1.default.isInitialized) {
                        console.warn(`[TranslateSheet] i18n not initialized for key: ${namespace}:${key}`);
                        return value; // Fallback to raw string
                    }
                    return i18next_1.default.t(`${namespace}:${key}`, {
                        ...options,
                        ...additionalOptions, // Pass additional options like format
                        defaultValue: value, // Fallback to the local value
                    });
                };
            }
            else if (typeof value === "string") {
                // Handle static strings with caching
                Object.defineProperty(processedTranslations, key, {
                    get: () => {
                        var _a;
                        if ((_a = i18next_1.default === null || i18next_1.default === void 0 ? void 0 : i18next_1.default.language) === null || _a === void 0 ? void 0 : _a.includes(primaryLanguage)) {
                            return value; // Directly return local value for primary language
                        }
                        if (cachedValue !== null) {
                            return cachedValue; // Return cached value if available
                        }
                        if (!i18next_1.default.isInitialized) {
                            // Suppress warning if local value can be returned
                            console.warn(`[TranslateSheet] i18n not initialized for key: ${namespace}:${key}`);
                            return value; // Fallback to raw string without caching
                        }
                        cachedValue = i18next_1.default.t(`${namespace}:${key}`, {
                            defaultValue: value,
                        });
                        return cachedValue;
                    },
                });
            }
            else {
                // Directly assign if it's a function
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
            },
        });
    },
};
exports.default = TranslateSheet;
