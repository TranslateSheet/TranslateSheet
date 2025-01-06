/**
 * Generate a JavaScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 */
declare const formatAsJavaScript: (content: Record<string, any>, targetLanguage: string) => string;
export default formatAsJavaScript;
