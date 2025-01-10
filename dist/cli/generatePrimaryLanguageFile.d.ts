#!/usr/bin/env node
import { TranslateSheetConfig } from "../types";
/**
 * Generate the primary language file.
 */
declare const generatePrimaryLanguageFile: ({ output, fileExtension, primaryLanguage, translations, }: Omit<TranslateSheetConfig, "apiKey" | "languages"> & {
    translations: Record<string, any>;
}) => void;
export default generatePrimaryLanguageFile;
