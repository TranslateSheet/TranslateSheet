/**
 * Send language content to the backend for storage and upsert.
 */
export const uploadTranslationContent = async ({
  apiKey,
  targetLanguage,
  content,
  isPrimary,
}: {
  apiKey: string;
  targetLanguage: string;
  content: Record<string, any>;
  isPrimary: boolean;
}): Promise<{ deletedKeyCount: number }> => {
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
          isPrimary,
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

    const data: any = await response.json().catch(() => ({}));
    const deletedKeyCount: number = data?.deletedKeyCount ?? 0;
    if (deletedKeyCount > 0) {
      console.log(
        `🧹 Removed ${deletedKeyCount} deleted key(s) from the backend.`
      );
    }
    console.log("💾 Successfully uploaded translations to backend.");
    return { deletedKeyCount };
  } catch (err) {
    console.error(
      "❌ Error sending primary language translations to backend:",
      err
    );
    throw err;
  }
};
