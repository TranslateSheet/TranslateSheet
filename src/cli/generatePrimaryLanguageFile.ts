#!/usr/bin/env node
import fs from "fs";
import path from "path";

const defaultLanguage = "en";

/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = (
  outputDir: string,
  translations: Record<string, any>
) => {
  const filePath = path.join(outputDir, `${defaultLanguage}.ts`);
  const content = `const ${defaultLanguage} = ${JSON.stringify(
    translations,
    null,
    2
  )};\nexport default ${defaultLanguage};`;
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Generated primary language file: ${filePath}`);
};

export default generatePrimaryLanguageFile;
