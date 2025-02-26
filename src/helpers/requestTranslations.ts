import sendTranslationRequest from "../api/sendTranslationRequest";
import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import sanitizeLanguage from "./sanitizeLanguage";
import formatTranslatedContent from "./formatTranslatedContent";

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
  generatePrimaryLanguageFile,
}: TranslateSheetConfig & {
  primaryLanguageContent: Record<string, any>;
}): Promise<void> => {
  let imports: string[] = [];
  let resources: string[] = [];

  const shouldWritePrimary =
    generatePrimaryLanguageFile === true ||
    generatePrimaryLanguageFile === "true";

  if (shouldWritePrimary) {
    const sanitizedPrimaryLanguage = sanitizeLanguage(primaryLanguage);
    imports = [
      `import ${sanitizedPrimaryLanguage} from "./${primaryLanguage}";`,
    ];
    resources = [`"${primaryLanguage}": ${sanitizedPrimaryLanguage}`];
  } else {
    resources = [`"${primaryLanguage}": "primary language"`];
  }

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

  const indexFilePath = path.join(
    output,
    `resources${fileExtension === ".ts" ? ".ts" : ".js"}`
  );
  fs.writeFileSync(indexFilePath, indexContent, "utf-8");
  console.log(
    `📦 Generated resources${fileExtension} file with all translations: ${indexFilePath}`
  );
};

export default requestTranslations;
