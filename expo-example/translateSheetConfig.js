/**
 * @type {import('translate-sheet').TranslateSheetConfig}
 */
const translateSheetConfig = {
  apiKey: "sk-4538f2aa-54e6-4e10-adde-52163ddc50c9",
  output: "./i18n",
  primaryLanguage: "en",
  fileExtension: ".ts",
  languages: ["es", "ja", "zh"],
  generatePrimaryLanguageFile: false,
  adapter: "i18next",
};

module.exports = translateSheetConfig;
