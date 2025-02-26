import { Command } from "commander";
import { TranslateSheetConfig } from "../types";
import { pullTranslationContent } from "../api/pullTranslationContent";
import { writeTranslationFiles } from "../helpers/writeTranslationFiles";
import { getMergedConfig } from "./getMergedConfig";
import { addCommonOptions } from "./addCommonOptions";

export function createPullCommand(): Command {
  const pullCmd = new Command("pull");
  addCommonOptions(pullCmd);

  pullCmd.action(async (cmd) => {
    const mergedConfig: TranslateSheetConfig = await getMergedConfig(cmd);

    console.log("Pulling translations from server...");

    try {
      const translationsByLang = await pullTranslationContent({
        apiKey: mergedConfig.apiKey,
      });

      writeTranslationFiles({
        translationsByLang,
        output: mergedConfig.output,
        fileExtension: mergedConfig.fileExtension,
      });

      console.log("✨ Pull complete!");
    } catch (err) {
      console.error("❌ Error pulling translations:", err);
      process.exit(1);
    }
  });

  return pullCmd;
}
