import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import formatTranslatedContent from "./formatTranslatedContent";

/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = ({
  output,
  fileExtension,
  primaryLanguage,
  primaryLanguageContent,
}: Omit<TranslateSheetConfig, "apiKey" | "languages" | "projectId"> & {
  primaryLanguageContent: Record<string, any>;
}) => {
  // 1) Use the shared format logic from `formatTranslatedContent`
  const formattedContent = formatTranslatedContent({
    fileExtension,
    translatedContent: primaryLanguageContent,
    targetLanguage: primaryLanguage,
    isPrimary: true
  });

  // 2) Determine the file path
  const filePath = path.join(output, `${primaryLanguage}${fileExtension}`);

  // 3) Write the formatted content to the file
  fs.writeFileSync(filePath, formattedContent, "utf-8");
  console.log(`Generated primary language file: ${filePath}`);
};

export default generatePrimaryLanguageFile;
