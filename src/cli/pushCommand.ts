import { Command } from "commander";
import { uploadTranslationContent } from "../api/uploadTranslationContent";
import { loadTranslationFile } from "../helpers/loadTranslationFile";
import { TranslateSheetConfig } from "../types";
import { getMergedConfig } from "./getMergedConfig";
import { addCommonOptions } from "./addCommonOptions";

export function createPushCommand(): Command {
  const pushCmd = new Command("push");
  addCommonOptions(pushCmd);

  pushCmd.action(async (cmd) => {
    const mergedConfig: TranslateSheetConfig = await getMergedConfig(cmd);

    if (!mergedConfig.apiKey) {
      console.error("❌ API key is required.");
      process.exit(1);
    }
    // 3) For each language, build file path, load file, flatten the content, and upload its content.
    for (const lang of mergedConfig.languages) {
      const filePath = `${mergedConfig.output}/${lang}${mergedConfig.fileExtension}`;
      console.log({ filePath });

      // Load the translation file.
      const content = await loadTranslationFile(filePath);
      if (!content) {
        console.warn(`No content loaded for language "${lang}". Skipping.`);
        continue;
      }

      // Determine if this language is the primary language.
      const isPrimary = lang === mergedConfig.primaryLanguage;
      console.log(`\nPushing language "${lang}"... (isPrimary: ${isPrimary})`);

      try {
        await uploadTranslationContent({
          apiKey: mergedConfig.apiKey,
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

  return pushCmd;
}
