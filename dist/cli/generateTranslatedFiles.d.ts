/**
 * Generate translated files for target languages.
 */
declare const generateTranslatedFiles: (outputDir: string, primaryContent: Record<string, any>, languages: string[], apiKey: string) => Promise<void>;
export default generateTranslatedFiles;
