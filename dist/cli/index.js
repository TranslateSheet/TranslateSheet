#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const loadConfig_1 = __importDefault(require("./loadConfig"));
const extractTranslations_1 = __importDefault(require("./extractTranslations"));
const generatePrimaryLanguageFile_1 = __importDefault(require("./generatePrimaryLanguageFile"));
const generateTranslatedFiles_1 = __importDefault(require("./generateTranslatedFiles"));
/**
 * Command-line interface setup with Commander.
 */
commander_1.program
    .command("generate")
    .option("--output <output>", "Output directory", undefined)
    .option("--language <language>", "Primary language", undefined)
    .option("--languages <languages>", "Comma-separated list of target languages", undefined)
    .option("--apiKey <apiKey>", "OpenAI API key", undefined)
    .option("--config <config>", "Path to configuration file", "./translateSheetConfig.ts")
    .action(async (cmd) => {
    const { output, language, languages, apiKey, config: configPath } = cmd;
    // Load configuration from file
    const config = (0, loadConfig_1.default)(configPath);
    // Merge CLI options with config file values
    const mergedConfig = {
        output: output || config.output || "./i18n",
        language: language || config.primaryLanguage || "en",
        languages: (languages === null || languages === void 0 ? void 0 : languages.split(",").map((lang) => lang.trim())) ||
            config.languages ||
            [],
        apiKey: apiKey || config.apiKey,
    };
    const { output: finalOutput, language: finalLanguage, languages: finalLanguages, apiKey: finalApiKey, } = mergedConfig;
    if (!finalApiKey) {
        console.error("API key is required. Provide it via config or CLI options.");
        process.exit(1);
    }
    // Extract translations
    console.log("Extracting translations...");
    const primaryTranslations = (0, extractTranslations_1.default)();
    // Generate primary language file
    console.log(`Generating primary language file (${finalLanguage})...`);
    (0, generatePrimaryLanguageFile_1.default)(finalOutput, primaryTranslations);
    // Generate translations for target languages
    if (finalLanguages.length > 0) {
        console.log("Generating translations for target languages...");
        await (0, generateTranslatedFiles_1.default)(finalOutput, primaryTranslations, finalLanguages, finalApiKey);
    }
});
commander_1.program.parse(process.argv);
