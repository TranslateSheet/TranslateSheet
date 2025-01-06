/**
 * Translate content using the TranslateSheet backend API.
 */
declare const translateContent: ({ content, targetLanguage, apiKey, }: {
    content: Record<string, any>;
    targetLanguage: string;
    apiKey: string;
}) => Promise<Record<string, any>>;
export default translateContent;
