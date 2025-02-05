import fetch from "node-fetch";

/**
 * Pull all translations from the backend for a given project.
 * Returns an object keyed by language.
 *
 * Example response (data):
 * {
 *   "en": { HomeScreen: { headerTitle: "Welcome!", ... }, ... },
 *   "es": { HomeScreen: { headerTitle: "¡Bienvenido!", ... }, ... }
 * }
 */
export const pullTranslationContent = async ({
  apiKey,
}: {
  apiKey: string;
}): Promise<Record<string, any>> => {
  try {
    const response = await fetch(
      "https://api.translatesheet.co/translations/pull-translations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
        }),
      }
    );

    if (!response.ok) {
      const errorResponse = await response.json().catch(() => null);
      console.error(
        "❌ Failed to pull translations via backend:",
        errorResponse
      );
      throw new Error(`Backend pull failed: ${response.statusText}`);
    }

    const resData = await response.json();
    if (!resData.success) {
      console.error("❌ Backend reported an unsuccessful pull:", resData);
      throw new Error("Pull translations request was not successful.");
    }

    // Assuming the backend returns { success: true, data: { ... } }
    console.log("✅ Successfully pulled translations from backend.");
    return resData.data; // This should be the object keyed by language
  } catch (err) {
    console.error("❌ Error pulling translations from backend:", err);
    throw err;
  }
};
