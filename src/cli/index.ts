#!/usr/bin/env node
import { program } from "commander";
import loadConfig from "./loadConfig";
import extractTranslations from "./extractTranslations";
import generatePrimaryLanguageFile from "./generatePrimaryLanguageFile";
import generateTranslatedFiles from "./generateTranslatedFiles";
import detectDuplicateNamespaces from "../helpers/detectDuplicateNamespaces";

/**
 * Command-line interface setup with Commander.
 */
program
  .command("generate")
  .option("--output <output>", "Output directory", undefined)
  .option("--language <language>", "Primary language", undefined)
  .option(
    "--languages <languages>",
    "Comma-separated list of target languages",
    undefined
  )
  .option("--fileExtension <fileExtension>", "File extension", undefined)
  .option("--apiKey <apiKey>", "OpenAI API key", undefined)
  .option(
    "--config <config>",
    "Path to configuration file",
    "./translateSheetConfig.js"
  )
  .action(async (cmd) => {
    const {
      output,
      language,
      languages,
      apiKey,
      fileExtension,
      config: configPath,
    } = cmd;

    // Load configuration from file
    const config = loadConfig(configPath);

    // Merge CLI options with config file values
    const mergedConfig = {
      output: output || config.output || "./i18n",
      language: language || config.primaryLanguage || "en",
      languages:
        languages?.split(",").map((lang: string) => lang.trim()) ||
        config.languages ||
        [],
      fileExtension: fileExtension || config.fileExtension || ".ts",
      apiKey: apiKey || config.apiKey,
    };

    const {
      output: finalOutput,
      language: finalLanguage,
      languages: finalLanguages,
      fileExtension: finalExtension,
      apiKey: finalApiKey,
    } = mergedConfig;

    // Extract translations
    console.log("Extracting translations...");
    const primaryTranslations = extractTranslations();

    // Detect and throw an error on duplicate namespaces
    detectDuplicateNamespaces(primaryTranslations);

    // Generate primary language file
    console.log(`Generating primary language file (${finalLanguage})...`);
    generatePrimaryLanguageFile({
      outputDir: finalOutput,
      translations: primaryTranslations,
      fileExtension: finalExtension,
    });

    // Generate translations for target languages
    if (finalLanguages.length > 0) {
      if (!finalApiKey) {
        console.error(
          "API key is required. Provide it via config or CLI options."
        );
        process.exit(1);
      }

      console.log("Generating translations for target languages...");
      await generateTranslatedFiles({
        outputDir: finalOutput,
        primaryContent: primaryTranslations,
        languages: finalLanguages,
        fileExtension: finalExtension,
        apiKey: finalApiKey,
      });
    }
  });

program.parse(process.argv);
