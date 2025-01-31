import fetch from "node-fetch";

/**
 * Send primary language translations to the backend for storage and upsert.
 */
export const uploadTranslationContent = async ({
  apiKey,
  targetLanguage,
  content,
}: {
  apiKey: string;
  targetLanguage: string;
  content: Record<string, any>;
}): Promise<void> => {
  try {

    const response = await fetch(
      "https://api.translatesheet.co/translations/upload",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          targetLanguage,
          content,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error(
        "❌ Failed to upload primary language translations via backend:",
        error
      );
      throw new Error(`Backend upload failed: ${response.statusText}`);
    }

    console.log("💾 Successfully uploaded translations to backend.");
  } catch (err) {
    console.error(
      "❌ Error sending primary language translations to backend:",
      err
    );
    throw err;
  }
};
