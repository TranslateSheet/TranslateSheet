import * as glob from "glob";
import fs from "fs";

/**
 * Extract translations from the codebase.
 * @returns {Record<string, any>} An object containing translations grouped by namespace.
 */
const extractTranslations = (): Record<string, any> => {
  const files = glob.sync("**/*.{ts,tsx,js,jsx,mjs,cjs,json,mdx}");
  const translations: Record<string, any> = {};

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
    const regex = /TranslateSheet\.create\("([^"]+)",\s*({[\s\S]*?})\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const namespace = match[1];
      const translationObject = eval(`(${match[2]})`);

      if (!translations[namespace]) {
        translations[namespace] = {};
      }
      Object.assign(translations[namespace], translationObject);
    }
  });

  return translations;
};

export default extractTranslations;
