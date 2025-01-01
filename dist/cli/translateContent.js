"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (content, targetLanguage, apiKey) => {
    try {
        console.log("Sending translation request...");
        console.log("Content to translate:", content);
        console.log("Target language:", targetLanguage);
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
        // Log the response status and headers
        console.log("API Response Status:", response.status);
        console.log("API Response Headers:", Object.fromEntries(response.headers));
        if (!response.ok) {
            const errorText = await response.text(); // Read the response body
            console.error("API Error Response Body:", errorText);
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("Translation API Response:", data);
        return data.translatedContent;
    }
    catch (error) {
        console.error("Error translating content via API:", error);
        throw error;
    }
};
exports.default = translateContent;
