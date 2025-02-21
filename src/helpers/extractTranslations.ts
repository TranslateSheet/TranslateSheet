import * as glob from "glob";
import fs from "fs";
import path from "path";

/**
 * Extract translations from the codebase.
 * @returns {Record<string, any>} An object containing translations grouped by namespace.
 */
const extractTranslations = (): Record<string, any> => {
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
    const regex = /TranslateSheet\.create\("([^"]+)",\s*({[\s\S]*?})\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const namespace = match[1];
      const translationObject = eval(`(${match[2]})`);

      if (!translations[namespace]) {
        translations[namespace] = {};
        seenKeysByNamespace.set(namespace, new Map());
      }

      const existingKeys = seenKeysByNamespace.get(namespace)!;

      Object.entries(translationObject).forEach(([key, value]) => {
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
    }
  });

  return translations;
};

export default extractTranslations;
