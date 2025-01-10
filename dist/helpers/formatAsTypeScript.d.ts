/**
 * Generate a TypeScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 * Ensures that language codes with hyphens are converted to valid TypeScript variable names by replacing hyphens with underscores.
 */
declare const formatAsTypeScript: (content: Record<string, any>, targetLanguage: string) => string;
export default formatAsTypeScript;
