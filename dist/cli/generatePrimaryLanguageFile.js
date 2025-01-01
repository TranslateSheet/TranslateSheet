#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
exports.default = generatePrimaryLanguageFile;
