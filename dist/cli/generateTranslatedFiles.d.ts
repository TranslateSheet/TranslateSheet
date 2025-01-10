import { TranslateSheetConfig } from "../types";
/**
 * Generate translated files for target languages.
 */
declare const generateTranslatedFiles: ({ output, primaryLanguageTranslations, languages, fileExtension, apiKey, }: Omit<TranslateSheetConfig, "primaryLanguage"> & {
    primaryLanguageTranslations: Record<string, any>;
}) => Promise<void>;
export default generateTranslatedFiles;
