import sendTranslationRequest from "./sendTranslationRequest";
import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import sanitizeLanguage from "../helpers/sanitizeLanguage";
import formatTranslatedContent from "./formatTranslatedContent";

/**
 * Request translated files for target languages from BE service
 */
const requestTranslations = async ({
  output,
  primaryLanguageTranslations,
  primaryLanguage,
  languages,
  fileExtension,
  apiKey,
}: TranslateSheetConfig & {
  primaryLanguageTranslations: Record<string, any>;
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
  for (const lang of uniqueLanguages) {
    const sanitizedLanguage = sanitizeLanguage(lang);
    console.log(`🌍 Translating content to ${lang}...`);
    try {
      const translatedContent = await sendTranslationRequest({
        content: primaryLanguageTranslations,
        targetLanguage: lang,
        apiKey,
      });
  
      const formattedContent = formatTranslatedContent({
        fileExtension,
        translatedContent,
        lang,
      });
  
      const filePath = path.join(output, `${lang}${fileExtension}`);
      fs.writeFileSync(filePath, formattedContent, "utf-8");
      console.log(`✅ Generated translation file: ${filePath}`);
  
      imports.push(`import ${sanitizedLanguage} from "./${lang}";`);
      resources.push(`"${lang}": ${sanitizedLanguage}`);
    } catch (error) {
      console.error(`❌ Failed to generate translation for ${lang}:`, error);
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
