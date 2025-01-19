import emojiFlagMap from "../constants/emojiFlagMap";

/**
 * Get emoji flag for a given language code.
 * Handles cases like "en-US" or "es-CO" by extracting the primary language.
 */
const getEmojiFlag = (lang: string): string => {
  // Extract the primary language code (e.g., "en" from "en-US")
  const primaryLang = lang.split('-')[0];
  
  // First check for the exact match, then fallback to primary language
  return emojiFlagMap[lang] || emojiFlagMap[primaryLang] || "🏳️"; // Default to white flag if not found
};

export default getEmojiFlag;
