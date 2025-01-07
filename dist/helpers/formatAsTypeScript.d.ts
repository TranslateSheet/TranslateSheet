/**
 * Generate a TypeScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 */
declare const formatAsTypeScript: (content: Record<string, any>, targetLanguage: string) => string;
export default formatAsTypeScript;
