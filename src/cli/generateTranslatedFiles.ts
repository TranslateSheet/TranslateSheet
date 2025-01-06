import translateContent from "./translateContent";
import fs from "fs";
import path from "path";
import { FileExtensions } from "../types";
import formatAsTypeScript from "./formatAsTypeScripts";
import formatAsJavaScript from "./formatAsJavaScript";
import formatAsJSON from "./formatAsJSON";

/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async ({
  outputDir,
  primaryContent,
  languages,
  fileExtension,
  apiKey,
}: {
  outputDir: string;
  primaryContent: Record<string, any>;
  languages: string[];
  fileExtension: FileExtensions;
  apiKey: string;
}) => {
  for (const lang of languages) {
    console.log(`Translating content to ${lang}...`);
    try {
      const translatedContent = await translateContent({
        content: primaryContent,
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

      const filePath = path.join(outputDir, `${lang}${fileExtension}`);
      // Write the formatted content to the appropriate file
      fs.writeFileSync(filePath, formattedContent, "utf-8");
      console.log(`Generated translation file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate translation for ${lang}:`, error);
    }
  }
};

export default generateTranslatedFiles;
