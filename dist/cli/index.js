"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob = require("glob");
const commander_1 = require("commander");
// Aggregated translations
const translations = {}; // Properly typed
// Extract translations from components
function extractTranslations() {
    const glob = require("glob"); // Dynamically require the package
    const files = glob.sync("**/*.tsx");
    files.forEach((file) => {
        const content = fs_1.default.readFileSync(file, "utf-8");
        // Match TranslateSheet.create calls
        const regex = /TranslateSheet\.create\("([^"]+)",\s*({[\s\S]*?})\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const namespace = match[1]; // Namespace (e.g., "sign-in")
            const translationObject = eval(`(${match[2]})`); // Evaluate the translation object
            if (!translations[namespace]) {
                translations[namespace] = {};
            }
            // Merge translations
            Object.assign(translations[namespace], translationObject);
        }
    });
}
// Generate centralized translation files
function generateTranslationFiles(outputDir, defaultLanguage) {
    // Ensure output directory exists
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    // Write the default language file
    const defaultLanguageFile = path_1.default.join(outputDir, `${defaultLanguage}.ts`);
    const content = `const ${defaultLanguage} = ${JSON.stringify(translations, null, 2)};\nexport default ${defaultLanguage};`;
    fs_1.default.writeFileSync(defaultLanguageFile, content, "utf-8");
    console.log(`Generated ${defaultLanguageFile}`);
}
// CLI setup
commander_1.program
    .option("-o, --output <path>", "Output directory for translation files", "i18n")
    .option("-l, --language <code>", "Default language code", "en")
    .action((options) => {
    const outputDir = path_1.default.resolve(process.cwd(), options.output);
    const defaultLanguage = options.language;
    extractTranslations();
    generateTranslationFiles(outputDir, defaultLanguage);
});
commander_1.program.parse(process.argv);
