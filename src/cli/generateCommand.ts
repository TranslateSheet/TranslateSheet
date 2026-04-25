import { Command } from "commander";
import writePrimaryLanguageFile from "../helpers/writePrimaryLanguageFile";
import requestTranslations from "../helpers/requestTranslations";
import { TranslateSheetConfig } from "../types";
import { uploadTranslationContent } from "../api/uploadTranslationContent";
import { getMergedConfig } from "./getMergedConfig";
import { addCommonOptions } from "./addCommonOptions";
import extractTranslateSheetObjects from "../helpers/extractTranslateSheetObjects";
import { generateTranslationTypesFile } from "../helpers/generateTranslationTypesFile";

export function createGenerateCommand(): Command {
  const generateCmd = new Command("generate");
  addCommonOptions(generateCmd);

  generateCmd.action(async (cmd) => {
    const config: TranslateSheetConfig = await getMergedConfig(cmd);

    // 3) Extract translations
    console.log("Extracting translations...");
    const primaryLanguageContent = extractTranslateSheetObjects();

    if (config.fileExtension === ".ts") {
      const filePath = generateTranslationTypesFile(
        primaryLanguageContent,
        config.output
      );
      console.log(`✅ Generated types file: ${filePath}`);
    }

    try {
      // 5) Upload primary language translations
      await uploadTranslationContent({
        apiKey: config.apiKey,
        targetLanguage: config.primaryLanguage,
        content: primaryLanguageContent,
        isPrimary: true,
      });
    } catch (err) {
      console.error(
        "❌ Failed to upload primary language translations to backend:",
        err
      );
      process.exit(1);
    }

    // 6) Generate the primary language file locally if option enabled
    if (config.generatePrimaryLanguageFile) {
      writePrimaryLanguageFile({
        output: config.output,
        primaryLanguageContent,
        fileExtension: config.fileExtension,
        primaryLanguage: config.primaryLanguage,
      });
    }

    // 7) Generate translations for target languages
    if (config.languages.length > 0) {
      if (!config.apiKey) {
        console.error(
          "API key is required. Provide it via config or CLI options."
        );
        process.exit(1);
      }

      const providerSuffix = config.anthropicKey
        ? " using your Anthropic API key"
        : config.openAiKey
          ? " using your OpenAI API key"
          : "";
      console.log(
        `Generating translations for target languages${providerSuffix}...`
      );
      await requestTranslations({
        output: config.output,
        primaryLanguageContent,
        primaryLanguage: config.primaryLanguage,
        languages: config.languages,
        fileExtension: config.fileExtension,
        apiKey: config.apiKey,
        openAiKey: config.openAiKey,
        anthropicKey: config.anthropicKey,
        generatePrimaryLanguageFile: config.generatePrimaryLanguageFile,
      });
    }
  });

  return generateCmd;
}
