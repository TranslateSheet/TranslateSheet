"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const translateContent_1 = __importDefault(require("./translateContent"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async (outputDir, primaryContent, languages, apiKey) => {
    for (const lang of languages) {
        console.log(`Translating content to ${lang}...`);
        try {
            const translatedContent = await (0, translateContent_1.default)(primaryContent, lang, apiKey);
            const filePath = path_1.default.join(outputDir, `${lang}.ts`);
            const content = `const ${lang} = ${JSON.stringify(translatedContent, null, 2)};\nexport default ${lang};`;
            fs_1.default.writeFileSync(filePath, content, "utf-8");
            console.log(`Generated translation file: ${filePath}`);
        }
        catch (error) {
            console.error(`Failed to generate translation for ${lang}:`, error);
        }
    }
};
exports.default = generateTranslatedFiles;
