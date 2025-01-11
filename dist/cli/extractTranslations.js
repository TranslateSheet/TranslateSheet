import * as glob from "glob";
import fs from "fs";
import path from "path";
/**
 * Extract translations from the codebase.
 * @returns {Record<string, any>} An object containing translations grouped by namespace.
 */
const extractTranslations = () => {
    const files = glob.sync("**/*.{ts,tsx,js,jsx,mjs,cjs,json,mdx}");
    const translations = {};
    files.forEach((file) => {
        const filePath = path.resolve(file);
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
            }
            Object.assign(translations[namespace], translationObject);
        }
    });
    return translations;
};
export default extractTranslations;
