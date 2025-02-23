import { Command } from "commander";
import { uploadTranslationContent } from "../api/uploadTranslationContent";
import { loadTranslationFile } from "../helpers/loadTranslationFile";
import loadConfig from "./loadConfig";
import { TranslateSheetConfig } from "../types";

export function createPushCommand(): Command {
  return new Command("push")
    .option("--output <output>", "Directory with local translations", "./i18n")
    .option("--languages <languages>", "Comma-separated languages", "")
    .option("--fileExtension <fileExtension>", "File extension", ".js")
    .option("--apiKey <apiKey>", "API key")
    .option("--primaryLanguage <primaryLanguage>", "Primary lang", "en")
    .action(async (cmd) => {
      // 1) Gather options
      const {
        output,
        primaryLanguage,
        languages,
        apiKey,
        fileExtension,
        config: configPath,
      } = cmd;

      // 2) Load configuration and merge with CLI options
      const config = await loadConfig(configPath);

      const configLangs =
        languages
          ?.split(",")
          .map((l) => l.trim())
          .filter(Boolean) || [];

      const finalLangs =
        configLangs.length > 0 ? configLangs : config.languages || [];

      const languagesToPush = [
        primaryLanguage,
        ...finalLangs.filter((lang) => lang !== primaryLanguage),
      ];

      const mergedConfig: TranslateSheetConfig = {
        output: output || config.output || "./i18n",
        primaryLanguage: primaryLanguage || config.primaryLanguage || "en",
        languages: languagesToPush,
        fileExtension: fileExtension || config.fileExtension || ".js",
        apiKey: apiKey || config.apiKey,
      };

      const {
        output: finalOutput,
        primaryLanguage: finalPrimaryLanguage,
        languages: finalLanguages,
        fileExtension: finalExtension,
        apiKey: finalApiKey,
      } = mergedConfig;

      if (!finalApiKey) {
        console.error("❌ API key is required.");
        process.exit(1);
      }

      // 3) For each language, build file path, load file, and upload its content.
      for (const lang of finalLanguages) {
        const filePath = `${finalOutput}/${lang}${finalExtension}`;
        console.log({ filePath });

        // Load the translation file.
        const content = await loadTranslationFile(filePath);
        if (!content) {
          console.warn(`No content loaded for language "${lang}". Skipping.`);
          continue;
        }

        // Determine if this language is the primary language.
        const isPrimary = lang === finalPrimaryLanguage;
        console.log(
          `\nPushing language "${lang}"... (isPrimary: ${isPrimary})`
        );

        try {
          await uploadTranslationContent({
            apiKey: finalApiKey,
            targetLanguage: lang,
            content,
            isPrimary,
          });
        } catch (err) {
          console.error(`❌ Failed uploading ${lang}:`, err);
        }
      }

      console.log("\n✨ Push complete!");
    });
}
