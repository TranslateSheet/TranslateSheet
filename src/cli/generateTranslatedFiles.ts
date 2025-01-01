import translateContent from "./translateContent";
import fs from "fs";
import path from "path";

/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async (
  outputDir: string,
  primaryContent: Record<string, any>,
  languages: string[],
  apiKey: string
) => {
  for (const lang of languages) {
    console.log(`Translating content to ${lang}...`);
    try {
      const translatedContent = await translateContent(
        primaryContent,
        lang,
        apiKey
      );

      const filePath = path.join(outputDir, `${lang}.ts`);
      const content = `const ${lang} = ${JSON.stringify(
        translatedContent,
        null,
        2
      )};\nexport default ${lang};`;
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Generated translation file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate translation for ${lang}:`, error);
    }
  }
};

export default generateTranslatedFiles;
