#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const glob = __importStar(require("glob"));
const commander_1 = require("commander");
const defaultLanguage = "en";
/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = (outputDir, translations) => {
    const filePath = path_1.default.join(outputDir, `${defaultLanguage}.ts`);
    const content = `const ${defaultLanguage} = ${JSON.stringify(translations, null, 2)};\nexport default ${defaultLanguage};`;
    fs_1.default.writeFileSync(filePath, content, "utf-8");
    console.log(`Generated primary language file: ${filePath}`);
};
/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (content, targetLanguage, apiKey) => {
    try {
        const response = await fetch("https://api.translatesheet.co/api/translations", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                targetLanguage,
                apiKey,
            }),
        });
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.translatedContent;
    }
    catch (error) {
        console.error("Error translating content via API:", error);
        throw error;
    }
};
/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async (outputDir, primaryContent, languages, apiKey) => {
    for (const lang of languages) {
        console.log(`Translating content to ${lang}...`);
        try {
            const translatedContent = await translateContent(primaryContent, lang, apiKey);
            const filePath = path_1.default.join(outputDir, `${lang}.ts`);
            const content = `const ${lang} = ${JSON.stringify(translatedContent, null, 2)};\nexport default ${lang};`;
            fs_1.default.writeFileSync(filePath, content, "utf-8");
            console.log(`Generated translation file: ${filePath}`);
        }
        catch (error) {
            console.error(`Failed to generate translation for ${lang}:`, error);
        }
    }
};
/**
 * Extract translations from the codebase.
 */
const extractTranslations = () => {
    const files = glob.sync("**/*.tsx");
    const translations = {};
    files.forEach((file) => {
        const content = fs_1.default.readFileSync(file, "utf-8");
        const regex = /TranslateSheet\.create\("([^"]+)",\s*({[\s\S]*?})\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const namespace = match[1];
            const translationObject = eval(`(${match[2]})`);
            if (!translations[namespace]) {
                translations[namespace] = {};
            }
            Object.assign(translations[namespace], translationObject);
        }
    });
    return translations;
};
/**
 * Command-line interface setup with Commander.
 */
commander_1.program
    .command("generate")
    .option("--output <output>", "Output directory", "./i18n")
    .option("--language <language>", "Primary language", "en")
    .option("--languages <languages>", "Comma-separated list of target languages", "")
    .option("--apiKey <apiKey>", "OpenAI API key")
    .action(async (cmd) => {
    const { output, language, languages, apiKey } = cmd;
    const targetLanguages = languages
        .split(",")
        .map((lang) => lang.trim());
    if (!apiKey) {
        console.error("OpenAI API key is required. Use the --apiKey option.");
        process.exit(1);
    }
    // Extract translations
    console.log("Extracting translations...");
    const primaryTranslations = extractTranslations();
    // Generate primary language file
    console.log(`Generating primary language file (${language})...`);
    generatePrimaryLanguageFile(output, primaryTranslations);
    // Generate translations for target languages
    if (targetLanguages.length > 0) {
        console.log("Generating translations for target languages...");
        await generateTranslatedFiles(output, primaryTranslations, targetLanguages, apiKey);
    }
});
commander_1.program.parse(process.argv);
