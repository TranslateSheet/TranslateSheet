/**
 * Generate a JavaScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 * Ensures that language codes with hyphens are converted to valid JavaScript variable names by replacing hyphens with underscores.
 */
declare const formatAsJavaScript: (content: Record<string, any>, targetLanguage: string) => string;
export default formatAsJavaScript;
