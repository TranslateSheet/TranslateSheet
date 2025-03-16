import i18n from "i18next";
import { LocalizationAdapter } from "../types";

const i18nextAdapter: LocalizationAdapter = {
  translate: (key, options) => i18n.t(key, options),
  setLanguage: (language) => i18n.changeLanguage(language),
  getLanguage: () => i18n.language,
  onLanguageChange: (onLanguageChange) => {
    i18n.on("languageChanged", () => onLanguageChange(i18n.language));
  },
};

export default i18nextAdapter;
