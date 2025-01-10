#!/usr/bin/env node
import { TranslateSheetConfig } from "../types";
/**
 * Generate the primary language file.
 */
declare const generatePrimaryLanguageFile: ({ output, fileExtension, primaryLanguage, primaryLanguageTranslations, }: Omit<TranslateSheetConfig, "apiKey" | "languages"> & {
    primaryLanguageTranslations: Record<string, any>;
}) => void;
export default generatePrimaryLanguageFile;
