import fs from "fs";
import path from "path";

import { FileExtensions } from "../types";
import formatTranslatedContent from "./formatTranslatedContent";

/**
 * Writes each language's content to a file, using the specified file extension.
 */
export function writeTranslationFiles({
  translationsByLang,
  output,
  fileExtension,
}: {
  translationsByLang: Record<string, any>;
  output: string;
  fileExtension: FileExtensions; // e.g. ".ts", ".js", ".json"
}) {
  for (const [lang, content] of Object.entries(translationsByLang)) {
    // 1) Format the content using your existing helper
    const formattedContent = formatTranslatedContent({
      fileExtension,
      translatedContent: content,
      targetLanguage: lang,
    });

    // 2) Build file path
    const filePath = path.join(output, `${lang}${fileExtension}`);

    // 3) Write the file
    fs.writeFileSync(filePath, formattedContent, "utf-8");
    console.log(`✅ Wrote ${filePath}`);
  }
}
