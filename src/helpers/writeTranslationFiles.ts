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
  shouldWritePrimaryLanguageFile,
  primaryLanguage,
}: {
  translationsByLang: Record<string, any>;
  output: string;
  fileExtension: FileExtensions;
  shouldWritePrimaryLanguageFile: boolean | string;
  primaryLanguage: string;
}) {
  const shouldWritePrimary =
    shouldWritePrimaryLanguageFile === true ||
    shouldWritePrimaryLanguageFile === "true";

  for (const [lang, content] of Object.entries(translationsByLang)) {
    if (
      (lang === primaryLanguage && shouldWritePrimary) ||
      lang !== primaryLanguage
    ) {
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
}
