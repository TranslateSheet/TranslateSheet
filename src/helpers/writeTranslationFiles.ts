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
  fileExtension: FileExtensions;
}) {
  for (const [lang, content] of Object.entries(translationsByLang)) {

    const formattedContent = formatTranslatedContent({
      fileExtension,
      translatedContent: content,
      targetLanguage: lang,
    });

    const filePath = path.join(output, `${lang}${fileExtension}`);

    fs.writeFileSync(filePath, formattedContent, "utf-8");
    console.log(`✅ Wrote ${filePath}`);
  }
}
