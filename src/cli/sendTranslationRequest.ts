/**
 * Send translation request to TranslateSheet API
 */
const sendTranslationRequest = async ({
  content,
  targetLanguage,
  apiKey,
}: {
  content: Record<string, any>;
  targetLanguage: string;
  apiKey: string;
}): Promise<Record<string, any>> => {
  try {
    console.log("Sending translation request...");

    const response = await fetch(
      "https://api.translatesheet.co/translations/translate-content",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          targetLanguage,
          apiKey,
        }),
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json();
      console.log(response.status);
      if (response.status === 403) {
        // throw new Error(
        //   "API key is invalid or disabled. Please check your API key."
        // );
        throw new Error(errorResponse.error);
      }
      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Ensure your API key has the correct permissions."
        );
      }
      if (response.status === 400) {
        throw new Error(
          `Bad request: ${errorResponse?.error || "Invalid request payload."}`
        );
      }
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${
          errorResponse?.error || "Unexpected error."
        }`
      );
    }

    const data = await response.json();

    return data.translatedContent;
  } catch (error) {
    console.error("Error translating content via API:", error);
    throw error;
  }
};

export default sendTranslationRequest;
