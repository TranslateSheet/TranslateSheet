"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const translateContent_1 = __importDefault(require("./translateContent"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const formatAsTypeScript_1 = __importDefault(require("../helpers/formatAsTypeScript"));
const formatAsJavaScript_1 = __importDefault(require("../helpers/formatAsJavaScript"));
const formatAsJSON_1 = __importDefault(require("../helpers/formatAsJSON"));
/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async ({ outputDir, primaryContent, languages, fileExtension, apiKey, }) => {
    for (const lang of languages) {
        console.log(`Translating content to ${lang}...`);
        try {
            const translatedContent = await (0, translateContent_1.default)({
                content: primaryContent,
                targetLanguage: lang,
                apiKey,
            });
            // Conditionally format the content based on file extension
            let formattedContent;
            if (fileExtension === ".js") {
                formattedContent = (0, formatAsJavaScript_1.default)(translatedContent, lang);
            }
            else if (fileExtension === ".ts") {
                formattedContent = (0, formatAsTypeScript_1.default)(translatedContent, lang);
            }
            else if (fileExtension === ".json") {
                formattedContent = (0, formatAsJSON_1.default)(translatedContent);
            }
            else {
                throw new Error(`Unsupported file extension: ${fileExtension}`);
            }
            const filePath = path_1.default.join(outputDir, `${lang}${fileExtension}`);
            // Write the formatted content to the appropriate file
            fs_1.default.writeFileSync(filePath, formattedContent, "utf-8");
            console.log(`Generated translation file: ${filePath}`);
        }
        catch (error) {
            console.error(`Failed to generate translation for ${lang}:`, error);
        }
    }
};
exports.default = generateTranslatedFiles;
