import { Command } from "commander";
import loadConfig from "./loadConfig";
import extractTranslations from "../helpers/extractTranslations";
import writePrimaryLanguageFile from "../helpers/writePrimaryLanguageFile";
import requestTranslations from "../helpers/requestTranslations";
import { TranslateSheetConfig } from "../types";
import { uploadTranslationContent } from "../api/uploadTranslationContent";

export function createGenerateCommand(): Command {
  const generateCmd = new Command("generate")
    .option("--output <output>", "Output directory", undefined)
    .option(
      "--primaryLanguage <primaryLanguage>",
      "Primary language",
      undefined
    )
    .option(
      "--languages <languages>",
      "Comma-separated list of target languages",
      undefined
    )
    .option("--fileExtension <fileExtension>", "File extension", undefined)
    .option("--apiKey <apiKey>", "TranslateSheet API key", undefined)
    .option(
      "--config <config>",
      "Path to configuration file",
      "./translateSheetConfig.js"
    )
    .option(
      "--generatePrimaryLanguageFile <generatePrimaryLanguageFIle>",
      "Generate primary language file",
      undefined
    )
    // TODO: available but not currently using
    .option("--projectId <projectId>", "TranslateSheet Project Id", undefined)
    .action(async (cmd) => {
      const {
        output,
        primaryLanguage,
        languages,
        fileExtension,
        apiKey,
        config: configPath,
        generatePrimaryLanguageFile,
      } = cmd;

      // 1) Load configuration from file
      const config = await loadConfig(configPath);

      // 2) Merge CLI options with config file values
      const mergedConfig: TranslateSheetConfig = {
        output: output || config.output || "./i18n",
        primaryLanguage: primaryLanguage || config.primaryLanguage || "en",
        languages:
          languages?.split(",").map((lang: string) => lang.trim()) ||
          config.languages ||
          [],
        fileExtension: fileExtension || config.fileExtension || ".ts",
        apiKey: apiKey || config.apiKey,
        generatePrimaryLanguageFile:
          generatePrimaryLanguageFile ||
          config.generatePrimaryLanguageFIle ||
          false,
      };

      const {
        output: finalOutput,
        primaryLanguage: finalPrimaryLanguage,
        languages: finalLanguages,
        fileExtension: finalExtension,
        apiKey: finalApiKey,
        generatePrimaryLanguageFile: finalGeneratePrimaryLanguageFile,
      }: TranslateSheetConfig = mergedConfig;

      // 3) Extract translations
      console.log("Extracting translations...");
      const primaryLanguageContent = extractTranslations();

      try {
        // 5) Upload primary language translations
        await uploadTranslationContent({
          apiKey: finalApiKey,
          targetLanguage: finalPrimaryLanguage,
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
      if (finalGeneratePrimaryLanguageFile) {
        writePrimaryLanguageFile({
          output: finalOutput,
          primaryLanguageContent,
          fileExtension: finalExtension,
          primaryLanguage: finalPrimaryLanguage,
        });
      }

      // 7) Generate translations for target languages
      if (finalLanguages.length > 0) {
        if (!finalApiKey) {
          console.error(
            "API key is required. Provide it via config or CLI options."
          );
          process.exit(1);
        }

        console.log("Generating translations for target languages...");
        await requestTranslations({
          output: finalOutput,
          primaryLanguageContent,
          primaryLanguage: finalPrimaryLanguage,
          languages: finalLanguages,
          fileExtension: finalExtension,
          apiKey: finalApiKey,
          generatePrimaryLanguageFile: finalGeneratePrimaryLanguageFile,
        });
      }
    });

  return generateCmd;
}
