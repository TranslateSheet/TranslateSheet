/**
 * @type {Object} TranslateSheetConfig
 * @property {string} apiKey - The API key used for authenticating with the TranslateSheet backend.
 * @property {string} output - The directory where the generated translation files will be saved.
 * @property {string} primaryLanguage - The primary language of the project (e.g., "en" for English).
 * @property {string} fileExtension - The file extension for the generated translation files (e.g., ".js" for JavaScript files).
 * @property {string[]} languages - An array of target languages for translation (e.g., ["es"] for Spanish).
 * @property {boolean} generatePrimaryLanguageFile - An optional flag to generate a translation file for the primary language.
 */
const translateSheetConfig = {
  apiKey: "sk-4538f2aa-54e6-4e10-adde-52163ddc50c9",
  output: "./i18n",
  primaryLanguage: "en",
  fileExtension: ".ts",
  languages: ["es", "ja", "zh"],
  generatePrimaryLanguageFile: false,
};

module.exports = translateSheetConfig;
