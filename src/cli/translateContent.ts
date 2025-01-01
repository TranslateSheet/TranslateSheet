/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (
    content: Record<string, any>,
    targetLanguage: string,
    apiKey: string
  ): Promise<Record<string, any>> => {
    try {
      console.log("Sending translation request...");
      console.log("Content to translate:", content);
      console.log("Target language:", targetLanguage);
  
      const response = await fetch("https://api.translatesheet.co/api/translations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`, // Ensure API key is sent in the correct format if required.
        },
        body: JSON.stringify({
          content,
          targetLanguage,
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
    } catch (error) {
      console.error("Error translating content via API:", error);
      throw error;
    }
  };
  


export default translateContent;
