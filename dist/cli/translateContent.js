"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (content, targetLanguage, apiKey) => {
    try {
        console.log("Sending translation request...");
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
            const errorResponse = await response.json();
            console.log(response.status);
            if (response.status === 403) {
                throw new Error("API key is invalid or disabled. Please check your API key.");
            }
            if (response.status === 401) {
                throw new Error("Unauthorized. Ensure your API key has the correct permissions.");
            }
            if (response.status === 400) {
                throw new Error(`Bad request: ${(errorResponse === null || errorResponse === void 0 ? void 0 : errorResponse.error) || "Invalid request payload."}`);
            }
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${(errorResponse === null || errorResponse === void 0 ? void 0 : errorResponse.error) || "Unexpected error."}`);
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
