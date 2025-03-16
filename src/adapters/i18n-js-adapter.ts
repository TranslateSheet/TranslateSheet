// i18n-js Adapter
import { I18n } from "i18n-js";
import { LocalizationAdapter } from "../types";

// Initialize a new i18n instance
const i18n = new I18n();

const i18nJsAdapter: LocalizationAdapter = {
  translate: (key, options) => i18n.t(key, options), // Translation method
  setLanguage: (language) => {
    i18n.locale = language; // Set the current locale
  },
  getLanguage: () => i18n.locale, // Get the current locale
  onLanguageChange: (onLanguageChange) => {
    i18n.onChange((language) => onLanguageChange(language.locale));
  },
};

export default i18nJsAdapter;
