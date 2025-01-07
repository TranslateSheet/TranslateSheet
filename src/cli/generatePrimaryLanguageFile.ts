#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { FileExtensions } from "../types";
import formatAsJSON from "../helpers/formatAsJSON";
import formatAsJavaScript from "../helpers/formatAsJavaScript";
import formatAsTypeScript from "../helpers/formatAsTypeScript";

const defaultLanguage = "en";

/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = ({
  outputDir,
  translations,
  fileExtension,
}: {
  outputDir: string;
  translations: Record<string, any>;
  fileExtension: FileExtensions;
}) => {
  let formattedContent: string;

  // Conditionally format the content based on file extension
  if (fileExtension === ".ts") {
    formattedContent = formatAsTypeScript(translations, defaultLanguage);
  } else if (fileExtension === ".js") {
    formattedContent = formatAsJavaScript(translations, defaultLanguage);
  } else if (fileExtension === ".json") {
    formattedContent = formatAsJSON(translations);
  } else {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }

  // Determine file path and extension
  const filePath = path.join(outputDir, `${defaultLanguage}${fileExtension}`);

  // Write the formatted content to the file
  fs.writeFileSync(filePath, formattedContent, "utf-8");
  console.log(`Generated primary language file: ${filePath}`);
};

export default generatePrimaryLanguageFile;
