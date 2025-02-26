import { TranslateSheetConfig } from "../types";
import loadConfig from "./loadConfig";

export async function getMergedConfig(
  cliOptions: Partial<TranslateSheetConfig> & {
    config?: string;
    languages?: string;
    generatePrimaryLanguageFile?: string | boolean;
  }
): Promise<TranslateSheetConfig> {
  const configPath = cliOptions.config || "./translateSheetConfig.js";
  const fileConfig = await loadConfig(configPath);

  // Convert comma-separated languages (if provided) to an array
  let cliLanguages: string[] | undefined;
  if (cliOptions.languages) {
    cliLanguages = cliOptions.languages.split(",").map((lang) => lang.trim());
  }

  // Merge CLI options > file config > defaults
  const merged: TranslateSheetConfig = {
    output: cliOptions.output || fileConfig.output || "./i18n",
    primaryLanguage:
      cliOptions.primaryLanguage || fileConfig.primaryLanguage || "en",
    languages: cliLanguages || fileConfig.languages || [],
    fileExtension:
      cliOptions.fileExtension || fileConfig.fileExtension || ".ts",
    apiKey: cliOptions.apiKey || fileConfig.apiKey,
    generatePrimaryLanguageFile:
      cliOptions.generatePrimaryLanguageFile !== undefined
        ? cliOptions.generatePrimaryLanguageFile === "true" ||
          cliOptions.generatePrimaryLanguageFile === true
        : fileConfig.generatePrimaryLanguageFile || false,
  };

  return merged;
}
