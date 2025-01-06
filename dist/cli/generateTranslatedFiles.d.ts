import { FileExtensions } from "../types";
/**
 * Generate translated files for target languages.
 */
declare const generateTranslatedFiles: ({ outputDir, primaryContent, languages, fileExtension, apiKey, }: {
    outputDir: string;
    primaryContent: Record<string, any>;
    languages: string[];
    fileExtension: FileExtensions;
    apiKey: string;
}) => Promise<void>;
export default generateTranslatedFiles;
