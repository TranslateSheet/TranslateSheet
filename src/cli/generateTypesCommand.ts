import { Command } from "commander";
import { TranslateSheetConfig } from "../types";
import { getMergedConfig } from "./getMergedConfig";
import { addCommonOptions } from "./addCommonOptions";
import extractTranslateSheetObjects from "../helpers/extractTranslateSheetObjects";
import { generateTranslationTypesFile } from "../helpers/generateTranslationTypesFile";


export function createGenerateTypesCommand(): Command {
  const generateTypesCmd = new Command("generate-types");
  addCommonOptions(generateTypesCmd);

  generateTypesCmd.action(async (cmd) => {
    const config: TranslateSheetConfig = await getMergedConfig(cmd);

    console.log("Extracting translations...");
    const primaryLanguageContent = extractTranslateSheetObjects();

    try {
      const filePath = generateTranslationTypesFile(
        primaryLanguageContent,
        config.output
      );
      console.log(`✅ Generated types file: ${filePath}`);
    } catch (err) {
      console.error("❌ Failed to generate types file:", err);
      process.exit(1);
    }
  });

  return generateTypesCmd;
}
