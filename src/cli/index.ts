#!/usr/bin/env node

import { program } from "commander";
import loadConfig from "./loadConfig";
import extractTranslations from "./extractTranslations";
import generatePrimaryLanguageFile from "./generatePrimaryLanguageFile";
import requestTranslations from "./requestTranslations";
import detectDuplicateNamespaces from "../helpers/detectDuplicateNamespaces";
import { TranslateSheetConfig } from "../types";
import { uploadTranslationContent } from "./uploadTranslationContent";

/**
 * Command-line interface setup with Commander.
 */
program
  .command("generate")
  .option("--output <output>", "Output directory", undefined)
  .option("--primaryLanguage <primaryLanguage>", "Primary language", undefined)
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
  // TODO: available but not currently using
  .option("--projectId <projectId>", "TranslateSheet Project Id", undefined)
  .action(async (cmd) => {
    const {
      output,
      primaryLanguage,
      languages,
      apiKey,
      // projectId,
      fileExtension,
      config: configPath,
    } = cmd;

    // Load configuration from file
    const config = loadConfig(configPath);

    // Merge CLI options with config file values
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

    const {
      output: finalOutput,
      primaryLanguage: finalPrimaryLanguage,
      languages: finalLanguages,
      fileExtension: finalExtension,
      apiKey: finalApiKey,
    }: TranslateSheetConfig = mergedConfig;

    // Extract translations
    console.log("Extracting translations...");
    const primaryLanguageContent = extractTranslations();

    // Detect and throw an error on duplicate namespaces
    detectDuplicateNamespaces(primaryLanguageContent);

    try {
      await uploadTranslationContent({
        apiKey: finalApiKey,
        targetLanguage: finalPrimaryLanguage,
        content: primaryLanguageContent,
      });
    } catch (err) {
      console.error(
        "❌ Failed to upload primary language translations to backend:",
        err
      );
      process.exit(1);
    }

    generatePrimaryLanguageFile({
      output: finalOutput,
      primaryLanguageContent,
      fileExtension: finalExtension,
      primaryLanguage: finalPrimaryLanguage,
    });

    // Generate translations for target languages
    if (finalLanguages.length > 0) {
      // TODO: move this apiKey check before we upload the primary language file
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
      });
    }
  });

program.parse(process.argv);
