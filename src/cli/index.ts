#!/usr/bin/env node
import fs from "fs";
import path from "path";
import * as glob from "glob";
import OpenAI from "openai";
import { program } from "commander";

const defaultLanguage = "en";

/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = (
  outputDir: string,
  translations: Record<string, any>,
) => {
  const filePath = path.join(outputDir, `${defaultLanguage}.ts`);
  const content = `const ${defaultLanguage} = ${JSON.stringify(
    translations,
    null,
    2,
  )};\nexport default ${defaultLanguage};`;
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Generated primary language file: ${filePath}`);
};

/**
 * Translate content using the TranslateSheet backend API.
 */
const translateContent = async (
  content: Record<string, any>,
  targetLanguage: string,
  apiKey: string
): Promise<Record<string, any>> => {
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
  } catch (error) {
    console.error("Error translating content via API:", error);
    throw error;
  }
};


/**
 * Generate translated files for target languages.
 */
const generateTranslatedFiles = async (
  outputDir: string,
  primaryContent: Record<string, any>,
  languages: string[],
  apiKey: string,
) => {
  for (const lang of languages) {
    console.log(`Translating content to ${lang}...`);
    try {
      const translatedContent = await translateContent(
        primaryContent,
        lang,
        apiKey
      );

      const filePath = path.join(outputDir, `${lang}.ts`);
      const content = `const ${lang} = ${JSON.stringify(
        translatedContent,
        null,
        2,
      )};\nexport default ${lang};`;
      fs.writeFileSync(filePath, content, "utf-8");
      console.log(`Generated translation file: ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate translation for ${lang}:`, error);
    }
  }
};

/**
 * Extract translations from the codebase.
 */
const extractTranslations = (): Record<string, any> => {
  const files = glob.sync("**/*.tsx");
  const translations: Record<string, any> = {};

  files.forEach((file) => {
    const content = fs.readFileSync(file, "utf-8");
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
program
  .command("generate")
  .option("--output <output>", "Output directory", "./i18n")
  .option("--language <language>", "Primary language", "en")
  .option(
    "--languages <languages>",
    "Comma-separated list of target languages",
    "",
  )
  .option("--apiKey <apiKey>", "OpenAI API key")
  .action(async (cmd) => {
    const { output, language, languages, apiKey } = cmd;
    const targetLanguages = languages
      .split(",")
      .map((lang: string) => lang.trim());

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
      await generateTranslatedFiles(
        output,
        primaryTranslations,
        targetLanguages,
        apiKey,
      );
    }
  });

program.parse(process.argv);
