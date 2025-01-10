#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import formatAsJSON from "../helpers/formatAsJSON";
import formatAsJavaScript from "../helpers/formatAsJavaScript";
import formatAsTypeScript from "../helpers/formatAsTypeScript";

/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = ({
  output,
  fileExtension,
  primaryLanguage,
  primaryLanguageTranslations,
}: Omit<TranslateSheetConfig, "apiKey" | "languages"> & {
  primaryLanguageTranslations: Record<string, any>;
}) => {
  let formattedContent: string;

  // Conditionally format the content based on file extension
  if (fileExtension === ".ts") {
    formattedContent = formatAsTypeScript(primaryLanguageTranslations, primaryLanguage);
  } else if (fileExtension === ".js") {
    formattedContent = formatAsJavaScript(primaryLanguageTranslations, primaryLanguage);
  } else if (fileExtension === ".json") {
    formattedContent = formatAsJSON(primaryLanguageTranslations);
  } else {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }

  // Determine file path and extension
  const filePath = path.join(output, `${primaryLanguage}${fileExtension}`);

  // Write the formatted content to the file
  fs.writeFileSync(filePath, formattedContent, "utf-8");
  console.log(`Generated primary language file: ${filePath}`);
};

export default generatePrimaryLanguageFile;
