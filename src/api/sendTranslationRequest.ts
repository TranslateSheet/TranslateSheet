/**
 * Send translation request to TranslateSheet API.
 *
 * The backend runs the OpenAI translation + Supabase persistence in the
 * background and responds 202 immediately. Callers should poll
 * pullTranslationContent until the target language is populated.
 */
const sendTranslationRequest = async ({
  content,
  targetLanguage,
  apiKey,
}: {
  content: Record<string, any>;
  targetLanguage: string;
  apiKey: string;
}): Promise<void> => {
  try {
    console.log("Sending translation request...");

    const response = await fetch(
      "https://api.translatesheet.co/translations/translate",
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
      const errorResponse = await response.json().catch(() => null);
      console.log(response.status);
      if (response.status === 403) {
        throw new Error(errorResponse?.error || "Forbidden");
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
  } catch (error) {
    console.error("Error translating content via API:", error);
    throw error;
  }
};

export default sendTranslationRequest;
