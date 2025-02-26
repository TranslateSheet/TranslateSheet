import { Command } from "commander";
import { uploadTranslationContent } from "../api/uploadTranslationContent";
import { loadTranslationFile } from "../helpers/loadTranslationFile";
import { TranslateSheetConfig } from "../types";
import { getMergedConfig } from "./getMergedConfig";
import { addCommonOptions } from "./addCommonOptions";
import extractTranslateSheetObjects from "../helpers/extractTranslateSheetObjects";

export function createPushCommand(): Command {
  const pushCmd = new Command("push");
  addCommonOptions(pushCmd);

  pushCmd.action(async (cmd) => {
    const config: TranslateSheetConfig = await getMergedConfig(cmd);

    const shouldWritePrimary =
      config.generatePrimaryLanguageFile === true ||
      config.generatePrimaryLanguageFile === "true";

    if (!config.apiKey) {
      console.error("❌ API key is required.");
      process.exit(1);
    }

    for (const lang of config.languages) {
      const isPrimary = lang === config.primaryLanguage;
      let content;

      if (isPrimary && !shouldWritePrimary) {
        // If there is no primaryLanguageFile, extract the primary language content
        // from the translation sheet object declarations and upload those to the DB
        content = extractTranslateSheetObjects();
      } else {
        const filePath = `${config.output}/${lang}${config.fileExtension}`;
        content = await loadTranslationFile(filePath);
      }

      if (!content) {
        console.warn(`No content loaded for language "${lang}". Skipping.`);
        continue;
      }

      console.log(`\nPushing language "${lang}"...`);

      try {
        await uploadTranslationContent({
          apiKey: config.apiKey,
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
