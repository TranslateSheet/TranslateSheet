export type FileExtensions = ".ts" | ".js" | ".json";

export interface TranslateSheetConfig {
  /** The API key used for AI-powered translations */
  apiKey: string;

  /** The id used to associate the project */
  projectId: string;

  /** The primary language of the project (e.g., "en" for English) */
  primaryLanguage: string;

  /** An array of target languages for translation (e.g., ["es", "fr", "de"]) */
  languages: string[];

  /** The file extension for the generated translation files */
  fileExtension: FileExtensions;

  /** The output directory where the generated translation files will be saved */
  output: string;
}
