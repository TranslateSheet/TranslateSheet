import { Command } from "commander";
import loadConfig from "./loadConfig";
import { TranslateSheetConfig } from "../types";
import { pullTranslationContent } from "../api/pullTranslationContent";
import { writeTranslationFiles } from "../helpers/writeTranslationFiles";

export function createPullCommand(): Command {
  const pullCmd = new Command("pull")
    .description("Pull the latest translations from the server and write them to your local project")
    .option("--output <output>", "Directory to write the pulled translations", undefined)
    .option("--primaryLanguage <primaryLanguage>", "Primary language", undefined)
    .option("--languages <languages>", "Comma-separated list of target languages", undefined)
    .option("--fileExtension <fileExtension>", "File extension", undefined)
    .option("--apiKey <apiKey>", "TranslateSheet API key", undefined)
    .option("--config <config>", "Path to configuration file", "./translateSheetConfig.js")
    // TODO: available but not currently using
    .option("--projectId <projectId>", "TranslateSheet Project Id", undefined)
    .action(async (cmd) => {
      const {
        output,
        primaryLanguage,
        languages,
        apiKey,
        fileExtension,
        config: configPath,
      } = cmd;

      const config = await loadConfig(configPath);

      // 2) Merge config
      const mergedConfig: TranslateSheetConfig = {
        output: output || config.output || "./i18n",
        primaryLanguage: primaryLanguage || config.primaryLanguage || "en",
        languages:
          languages?.split(",").map((lang: string) => lang.trim()) ||
          config.languages ||
          [],
        fileExtension: fileExtension || config.fileExtension || ".ts",
        apiKey: apiKey || config.apiKey,
      };

      console.log("Pulling translations from server...");

      try {
        const translationsByLang = await pullTranslationContent({
          apiKey: mergedConfig.apiKey,
        });

        writeTranslationFiles({
          translationsByLang,
          output: mergedConfig.output,
          fileExtension: mergedConfig.fileExtension
        });

        console.log("✨ Pull complete!");
      } catch (err) {
        console.error("❌ Error pulling translations:", err);
        process.exit(1);
      }
    });

  return pullCmd;
}
