"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const TranslateSheet = {
    create(namespace, translations) {
        const processedTranslations = {};
        Object.keys(translations).forEach((key) => {
            const value = translations[key];
            // Cache for static translations
            let cachedValue = null;
            if (typeof value === "string" && value.includes("{{")) {
                // Handle interpolated strings
                processedTranslations[key] = (options, additionalOptions) => {
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
                        if (cachedValue !== null) {
                            return cachedValue;
                        }
                        if (!i18next_1.default.isInitialized) {
                            console.warn(`[TranslateSheet] i18n not initialized for key: ${namespace}:${key}`);
                            return value; // Return raw string without caching
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
