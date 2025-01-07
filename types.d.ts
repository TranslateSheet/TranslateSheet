// types.d.ts

export interface TranslateSheetConfig {
  /** The API key used for authenticating with the TranslateSheet backend */
  apiKey: string;

  /** The directory where the generated translation files will be saved */
  output: string;

  /** The primary language of the project (e.g., "en" for English) */
  primaryLanguage: string;

  /** The file extension for the generated translation files (e.g., ".ts", ".js", ".json") */
  fileExtension: ".ts" | ".js" | ".json";

  /** An array of target languages for translation (e.g., ["es", "ru", "ja"]) */
  languages: string[];
}