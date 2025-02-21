import i18n from "i18next";
import useLanguageChange from "../lib/hooks/useLanguageChange";
import languageChangeEmitter from "./utils/languageChangeEmitter";
import validateInterpolatedKeys from "../lib/utils/validateInterpolatedKeys";
let globalI18nInitialized = false;
i18n.on("initialized", () => {
    globalI18nInitialized = true;
});
const TranslateSheet = {
    create(namespace, translations) {
        const primaryLanguage = "en";
        const processedTranslations = {};
        const cachedValues = new Map();
        // Clear cache on language change
        i18n.on("languageChanged", () => {
            cachedValues.clear();
            languageChangeEmitter.emit();
        });
        Object.keys(translations).forEach((key) => {
            const value = translations[key];
            if (typeof value === "string" && value.includes("{{")) {
                processedTranslations[key] = (options, additionalOptions) => {
                    var _a, _b;
                    // TODO: this hook is in charge of forcing re-renders on a language change
                    // It is the reason why we cannot currently use TranslateSheet.create in a non-react environment
                    useLanguageChange();
                    // Validate interpolations
                    if (options) {
                        validateInterpolatedKeys(value, options);
                    }
                    else {
                        console.warn(`[TranslateSheet] Missing interpolated values for key: "${namespace}:${key}". Expected keys: ${((_a = value
                            .match(/\{\{(.*?)\}\}/g)) === null || _a === void 0 ? void 0 : _a.map((k) => k.replace(/{{|}}/g, "")).join(", ")) || "none"}.`);
                    }
                    if (!globalI18nInitialized ||
                        ((_b = i18n === null || i18n === void 0 ? void 0 : i18n.language) === null || _b === void 0 ? void 0 : _b.includes(primaryLanguage))) {
                        return value.replace(/\{\{(.*?)\}\}/g, (_, p1) => { var _a; return (_a = options === null || options === void 0 ? void 0 : options[p1]) !== null && _a !== void 0 ? _a : `{{ ${p1} }}`; });
                    }
                    return i18n.t(`${namespace}:${key}`, Object.assign(Object.assign(Object.assign({}, options), additionalOptions), { defaultValue: value }));
                };
            }
            else if (typeof value === "string") {
                Object.defineProperty(processedTranslations, key, {
                    get: () => {
                        var _a;
                        // TODO: same as above
                        useLanguageChange();
                        if (!globalI18nInitialized ||
                            ((_a = i18n === null || i18n === void 0 ? void 0 : i18n.language) === null || _a === void 0 ? void 0 : _a.includes(primaryLanguage))) {
                            return value;
                        }
                        if (cachedValues.has(key)) {
                            return cachedValues.get(key);
                        }
                        const translatedValue = i18n.t(`${namespace}:${key}`, {
                            defaultValue: value,
                        });
                        cachedValues.set(key, translatedValue);
                        return translatedValue;
                    },
                });
            }
            else {
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
export default TranslateSheet;
