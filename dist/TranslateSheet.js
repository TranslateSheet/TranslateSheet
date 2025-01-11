"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const TranslateSheet = {
    create(namespace, translations) {
        let i18nInitialized = false;
        let warnedAboutInitializationDelay = false;
        // Listen for i18next initialization and set the flag
        i18next_1.default.on("initialized", () => {
            i18nInitialized = true;
        });
        // Warn if i18n is not initialized after a significant delay (500ms)
        setTimeout(() => {
            if (!i18nInitialized && !warnedAboutInitializationDelay) {
                console.warn(`[TranslateSheet] i18n not initialized after 500ms. Ensure that initI18n is called before using translations.`);
                warnedAboutInitializationDelay = true;
            }
        }, 500);
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
                    // DEV mode: Directly return local value for primary language
                    if ((_a = i18next_1.default === null || i18next_1.default === void 0 ? void 0 : i18next_1.default.language) === null || _a === void 0 ? void 0 : _a.includes(primaryLanguage)) {
                        return value.replace(/\{\{(.*?)\}\}/g, (_, p1) => { var _a; return (_a = options === null || options === void 0 ? void 0 : options[p1]) !== null && _a !== void 0 ? _a : `{{ ${p1} }}`; });
                    }
                    if (!i18nInitialized) {
                        return value; // Suppress warning during startup
                    }
                    const result = i18next_1.default.t(`${namespace}:${key}`, {
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
            }
            else if (typeof value === "string") {
                // Handle static strings with caching
                Object.defineProperty(processedTranslations, key, {
                    get: () => {
                        var _a;
                        // DEV mode: Directly return local value for primary language
                        if ((_a = i18next_1.default === null || i18next_1.default === void 0 ? void 0 : i18next_1.default.language) === null || _a === void 0 ? void 0 : _a.includes(primaryLanguage)) {
                            return value;
                        }
                        if (cachedValue !== null) {
                            return cachedValue;
                        }
                        if (!i18nInitialized) {
                            return value; // Suppress warning during startup
                        }
                        cachedValue = i18next_1.default.t(`${namespace}:${key}`, {
                            defaultValue: value,
                        });
                        // Log warning if translation is missing
                        if (cachedValue === key) {
                            console.warn(`[TranslateSheet] Missing translation for key: ${namespace}:${key}`);
                        }
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
