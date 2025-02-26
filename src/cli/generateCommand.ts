import { Command } from "commander";
import extractTranslations from "../helpers/extractTranslations";
import writePrimaryLanguageFile from "../helpers/writePrimaryLanguageFile";
import requestTranslations from "../helpers/requestTranslations";
import { TranslateSheetConfig } from "../types";
import { uploadTranslationContent } from "../api/uploadTranslationContent";
import { getMergedConfig } from "./getMergedConfig";
import { addCommonOptions } from "./addCommonOptions";

export function createGenerateCommand(): Command {
  const generateCmd = new Command("generate");
  addCommonOptions(generateCmd);

  generateCmd.action(async (cmd) => {
    const mergedConfig: TranslateSheetConfig = await getMergedConfig(cmd);

    // 3) Extract translations
    console.log("Extracting translations...");
    const primaryLanguageContent = extractTranslations();

    try {
      // 5) Upload primary language translations
      await uploadTranslationContent({
        apiKey: mergedConfig.apiKey,
        targetLanguage: mergedConfig.primaryLanguage,
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
    if (mergedConfig.generatePrimaryLanguageFile) {
      writePrimaryLanguageFile({
        output: mergedConfig.output,
        primaryLanguageContent,
        fileExtension: mergedConfig.fileExtension,
        primaryLanguage: mergedConfig.primaryLanguage,
      });
    }

    // 7) Generate translations for target languages
    if (mergedConfig.languages.length > 0) {
      if (!mergedConfig.apiKey) {
        console.error(
          "API key is required. Provide it via config or CLI options."
        );
        process.exit(1);
      }

      console.log("Generating translations for target languages...");
      await requestTranslations({
        output: mergedConfig.output,
        primaryLanguageContent,
        primaryLanguage: mergedConfig.primaryLanguage,
        languages: mergedConfig.languages,
        fileExtension: mergedConfig.fileExtension,
        apiKey: mergedConfig.apiKey,
        generatePrimaryLanguageFile: mergedConfig.generatePrimaryLanguageFile,
      });
    }
  });

  return generateCmd;
}
