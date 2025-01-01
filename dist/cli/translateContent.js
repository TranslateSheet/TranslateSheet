"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (content, targetLanguage, apiKey) => {
    try {
        const response = await fetch("https://api.translatesheet.co/api/translations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                targetLanguage,
                apiKey,
            }),
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.translatedContent;
    }
    catch (error) {
        console.error("Error translating content via API:", error);
        throw error;
    }
};
exports.default = translateContent;
