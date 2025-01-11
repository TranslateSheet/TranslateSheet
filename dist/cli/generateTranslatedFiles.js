import translateContent from "./translateContent";
import fs from "fs";
import path from "path";
import formatAsTypeScript from "../helpers/formatAsTypeScript";
import formatAsJavaScript from "../helpers/formatAsJavaScript";
import formatAsJSON from "../helpers/formatAsJSON";
import sanitizeLanguage from "../helpers/sanitizeLanguage";
/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async ({ output, primaryLanguageTranslations, primaryLanguage, languages, fileExtension, apiKey, }) => {
    const sanitizedPrimaryLanguage = sanitizeLanguage(primaryLanguage);
    const imports = [
        `import ${sanitizedPrimaryLanguage} from "./${primaryLanguage}";`,
    ];
    const resources = [
        `"${primaryLanguage}": ${sanitizedPrimaryLanguage}`,
    ];
    for (const lang of languages) {
        const sanitizedLanguage = sanitizeLanguage(lang);
        console.log(`Translating content to ${lang}...`);
        try {
            const translatedContent = await translateContent({
                content: primaryLanguageTranslations,
                targetLanguage: lang,
                apiKey,
            });
            // Conditionally format the content based on file extension
            let formattedContent;
            if (fileExtension === ".js") {
                formattedContent = formatAsJavaScript(translatedContent, lang);
            }
            else if (fileExtension === ".ts") {
                formattedContent = formatAsTypeScript(translatedContent, lang);
            }
            else if (fileExtension === ".json") {
                formattedContent = formatAsJSON(translatedContent);
            }
            else {
                throw new Error(`Unsupported file extension: ${fileExtension}`);
            }
            const filePath = path.join(output, `${lang}${fileExtension}`);
            // Write the formatted content to the appropriate file
            fs.writeFileSync(filePath, formattedContent, "utf-8");
            console.log(`Generated translation file: ${filePath}`);
            // Add to imports and resources for index.ts generation
            imports.push(`import ${sanitizedLanguage} from "./${lang}";`);
            resources.push(`"${lang}": ${sanitizedLanguage}`);
        }
        catch (error) {
            console.error(`Failed to generate translation for ${lang}:`, error);
        }
    }
    // Generate index.ts with dynamic imports and resource object
    const indexContent = `
${imports.join("\n")}

const resources = {
  ${resources.join(",\n  ")}
};

export default resources;
`;
    const indexFilePath = path.join(output, `resources${fileExtension}`);
    fs.writeFileSync(indexFilePath, indexContent, "utf-8");
    console.log(`Generated resources${fileExtension} file with all translations: ${indexFilePath}`);
};
export default generateTranslatedFiles;
