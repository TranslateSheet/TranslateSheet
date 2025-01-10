import translateContent from "./translateContent";
import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import formatAsTypeScript from "../helpers/formatAsTypeScript";
import formatAsJavaScript from "../helpers/formatAsJavaScript";
import formatAsJSON from "../helpers/formatAsJSON";

/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async ({
  output,
  primaryLanguageTranslations,
  languages,
  fileExtension,
  apiKey,
}: Omit<TranslateSheetConfig, "primaryLanguage"> & {
  primaryLanguageTranslations: Record<string, any>;
}): Promise<undefined> => {
  for (const lang of languages) {
    console.log(`Translating content to ${lang}...`);
    try {
      const translatedContent = await translateContent({
        content: primaryLanguageTranslations,
        targetLanguage: lang,
        apiKey,
      });

      // Conditionally format the content based on file extension
      let formattedContent: string;
      if (fileExtension === ".js") {
        formattedContent = formatAsJavaScript(translatedContent, lang);
      } else if (fileExtension === ".ts") {
        formattedContent = formatAsTypeScript(translatedContent, lang);
      } else if (fileExtension === ".json") {
        formattedContent = formatAsJSON(translatedContent);
      } else {
        throw new Error(`Unsupported file extension: ${fileExtension}`);
      }

      const filePath = path.join(output, `${lang}${fileExtension}`);
      // Write the formatted content to the appropriate file
      fs.writeFileSync(filePath, formattedContent, "utf-8");
      console.log(`Generated translation file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate translation for ${lang}:`, error);
    }
  }
};

export default generateTranslatedFiles;
