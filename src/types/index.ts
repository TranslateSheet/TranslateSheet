export type FileExtensions = ".ts" | ".js" | ".json";

export interface TranslateSheetConfig {
  /** The API key used for AI-powered translations */
  apiKey: string;

  /** The id used to associate the project */
  // TODO: available but not currently using
  projectId?: string;

  /** The primary language of the project (e.g., "en" for English) */
  primaryLanguage: string;

  /** An array of target languages for translation (e.g., ["es", "fr", "de"]) */
  languages: string[];

  /** The file extension for the generated translation files */
  fileExtension: FileExtensions;

  /** The output directory where the generated translation files will be saved */
  output: string;

  /** The output directory where the generated translation files will be saved */
  generatePrimaryLanguageFile: string | boolean;

  /**
   * Optional user-supplied OpenAI API key. When set, the backend uses this key
   * for the LLM call instead of the TranslateSheet-managed key. Not stored.
   */
  openAiKey?: string;

  /**
   * Optional user-supplied Anthropic API key. When set, the backend translates
   * via Claude using this key instead of OpenAI. Takes precedence over openAiKey.
   * Not stored.
   */
  anthropicKey?: string;
}
