/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (
  content: Record<string, any>,
  targetLanguage: string,
  apiKey: string
): Promise<Record<string, any>> => {
  try {
    const response = await fetch(
      "https://api.translatesheet.co/api/translations",
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.translatedContent;
  } catch (error) {
    console.error("Error translating content via API:", error);
    throw error;
  }
};

export default translateContent;
