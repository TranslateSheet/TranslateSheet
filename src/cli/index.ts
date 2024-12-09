import fs from "fs";
import path from "path";
const glob = require("glob");
import { program } from "commander";

// Define the structure of the translations object
type Translations = {
  [namespace: string]: Record<string, string>;
};

// Aggregated translations
const translations: Translations = {}; // Properly typed

// Extract translations from components
function extractTranslations() {
  const glob = require("glob"); // Dynamically require the package
  const files = glob.sync("**/*.tsx");

  files.forEach((file: string) => {
    const content = fs.readFileSync(file, "utf-8");

    // Match TranslateSheet.create calls
    const regex = /TranslateSheet\.create\("([^"]+)",\s*({[\s\S]*?})\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const namespace = match[1]; // Namespace (e.g., "sign-in")
      const translationObject: Record<string, string> = eval(`(${match[2]})`); // Evaluate the translation object

      if (!translations[namespace]) {
        translations[namespace] = {};
      }

      // Merge translations
      Object.assign(translations[namespace], translationObject);
    }
  });
}


// Generate centralized translation files
function generateTranslationFiles(outputDir: string, defaultLanguage: string) {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write the default language file
  const defaultLanguageFile = path.join(outputDir, `${defaultLanguage}.ts`);
  const content = `const ${defaultLanguage} = ${JSON.stringify(
    translations,
    null,
    2
  )};\nexport default ${defaultLanguage};`;
  fs.writeFileSync(defaultLanguageFile, content, "utf-8");

  console.log(`Generated ${defaultLanguageFile}`);
}

// CLI setup
program
  .option("-o, --output <path>", "Output directory for translation files", "i18n")
  .option("-l, --language <code>", "Default language code", "en")
  .action((options) => {
    const outputDir = path.resolve(process.cwd(), options.output);
    const defaultLanguage = options.language;

    extractTranslations();
    generateTranslationFiles(outputDir, defaultLanguage);
  });

program.parse(process.argv);
