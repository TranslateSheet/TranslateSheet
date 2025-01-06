#!/usr/bin/env node
import { FileExtensions } from "../types";
/**
 * Generate the primary language file.
 */
declare const generatePrimaryLanguageFile: ({ outputDir, translations, fileExtension, }: {
    outputDir: string;
    translations: Record<string, any>;
    fileExtension: FileExtensions;
}) => void;
export default generatePrimaryLanguageFile;
