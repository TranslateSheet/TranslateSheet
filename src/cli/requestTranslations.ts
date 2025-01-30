import sendTranslationRequest from "./sendTranslationRequest";
import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import sanitizeLanguage from "../helpers/sanitizeLanguage";
import formatTranslatedContent from "./formatTranslatedContent";
import { uploadTranslationContent } from "./uploadTranslationContent";

/**
 * Request translated files for target languages from BE service
 */
const requestTranslations = async ({
  output,
  primaryLanguageContent,
  primaryLanguage,
  languages,
  fileExtension,
  apiKey,
}: TranslateSheetConfig & {
  primaryLanguageContent: Record<string, any>;
}): Promise<void> => {
  const sanitizedPrimaryLanguage = sanitizeLanguage(primaryLanguage);

  const imports: string[] = [
    `import ${sanitizedPrimaryLanguage} from "./${primaryLanguage}";`,
  ];
  const resources: string[] = [
    `"${primaryLanguage}": ${sanitizedPrimaryLanguage}`,
  ];

  // Safeguard against duplicate languages
  const uniqueLanguages = Array.from(new Set(languages));
  for (const targetLanguage of uniqueLanguages) {
    const sanitizedLanguage = sanitizeLanguage(targetLanguage);
    console.log(`🌍 Translating content to ${targetLanguage}...`);
    try {
      const translatedContent = await sendTranslationRequest({
        content: primaryLanguageContent,
        targetLanguage,
        apiKey,
      });

      const formattedContent = formatTranslatedContent({
        fileExtension,
        translatedContent,
        targetLanguage,
      });

      const filePath = path.join(output, `${targetLanguage}${fileExtension}`);
      fs.writeFileSync(filePath, formattedContent, "utf-8");
      console.log(`✅ Generated translation file: ${filePath}`);

      imports.push(`import ${sanitizedLanguage} from "./${targetLanguage}";`);
      resources.push(`"${targetLanguage}": ${sanitizedLanguage}`);

      // TODO: were sending this data back and forth twice to the backend. 
      // TODO: i feel we should translate the content and upload it all in the same request
      
      try {
        await uploadTranslationContent({
          apiKey,
          targetLanguage,
          content: translatedContent,
        });

      } catch (err) {
        console.error(
          "❌ Failed to upload primary language translations to backend:",
          err
        );
        process.exit(1);
      }
    } catch (error) {
      console.error(
        `❌ Failed to generate translation for ${targetLanguage}:`,
        error
      );
    }
  }

  // Generate index.ts with dynamic imports and resource object
  const indexContent = `
${imports.join("\n")}

const resources = {
  ${resources.join(",\n  ")}
};

export default resources;
`;

  const indexFilePath = path.join(output, `resources${fileExtension}`);
  fs.writeFileSync(indexFilePath, indexContent, "utf-8");
  console.log(
    `📦 Generated resources${fileExtension} file with all translations: ${indexFilePath}`
  );
};

export default requestTranslations;
