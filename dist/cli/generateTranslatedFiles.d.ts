import { TranslateSheetConfig } from "../types";
/**
 * Generate translated files for target languages.
 */
declare const generateTranslatedFiles: ({ output, primaryLanguageTranslations, primaryLanguage, languages, fileExtension, apiKey, }: TranslateSheetConfig & {
    primaryLanguageTranslations: Record<string, any>;
}) => Promise<void>;
export default generateTranslatedFiles;
