import * as glob from "glob";
import fs from "fs";
import path from "path";
import balanced from "balanced-match"; // Ensure this package is installed
import { flattenTranslations } from "./flattenTranslation";

/**
 * Extract translations from the codebase.
 * @returns {Record<string, any>} An object containing translations grouped by namespace.
 */
const extractTranslateSheetObjects = (): Record<string, any> => {
  const projectRoot = path.resolve(".");
  const files = glob.sync("**/*.{ts,tsx,js,jsx,mjs,cjs,json,mdx}", {
    ignore: ["node_modules/**", "dist/**", "build/**"],
  });

  const translations: Record<string, any> = {};
  const seenKeysByNamespace = new Map<string, Map<string, string>>();

  files.forEach((file) => {
    const filePath = path.resolve(file);
    const relativeFilePath = path.relative(projectRoot, filePath);

    // Skip directories
    if (fs.statSync(filePath).isDirectory()) {
      return;
    }

    const content = fs.readFileSync(filePath, "utf-8");
    // Updated regex: match both single and double quotes for the namespace.
    const regex = /TranslateSheet\.create\(\s*(['"])([^'"]+)\1\s*,/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(content)) !== null) {
      const namespace = match[2];
      // Find the starting position of the translation object.
      const startIndex = content.indexOf("{", regex.lastIndex);
      if (startIndex === -1) continue;

      // Use balanced-match to extract the entire object literal, including nested braces.
      const balancedResult = balanced("{", "}", content.slice(startIndex));
      if (!balancedResult) continue;
      const objectString = "{" + balancedResult.body + "}";
      // Update regex.lastIndex to move past the current matched object.
      regex.lastIndex = startIndex + balancedResult.end + 1;

      try {
        const translationObject = eval(`(${objectString})`);
        const flattened = flattenTranslations(translationObject);

        if (!translations[namespace]) {
          translations[namespace] = {};
          seenKeysByNamespace.set(namespace, new Map());
        }
        const existingKeys = seenKeysByNamespace.get(namespace)!;

        Object.entries(flattened).forEach(([key, value]) => {
          if (existingKeys.has(key)) {
            console.error(
              `[TranslateSheet] Duplicate key detected: "${namespace}.${key}"` +
                `\n - First found in: ${existingKeys.get(key)}` +
                `\n - Also found in: ${relativeFilePath}`
            );
            process.exit(1);
          }
          existingKeys.set(key, relativeFilePath);
          translations[namespace][key] = value;
        });
      } catch (error) {
        console.error(
          `[TranslateSheet] Failed to eval translation object in ${relativeFilePath}:`,
          error
        );
      }
    }
  });

  return translations;
};

export default extractTranslateSheetObjects;
