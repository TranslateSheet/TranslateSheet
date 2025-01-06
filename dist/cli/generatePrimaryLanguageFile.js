#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const formatAsJSON_1 = __importDefault(require("./formatAsJSON"));
const formatAsJavaScript_1 = __importDefault(require("./formatAsJavaScript"));
const formatAsTypeScripts_1 = __importDefault(require("./formatAsTypeScripts"));
const defaultLanguage = "en";
/**
 * Generate the primary language file.
 */
const generatePrimaryLanguageFile = ({ outputDir, translations, fileExtension, }) => {
    let formattedContent;
    // Conditionally format the content based on file extension
    if (fileExtension === ".ts") {
        formattedContent = (0, formatAsTypeScripts_1.default)(translations, defaultLanguage);
    }
    else if (fileExtension === ".js") {
        formattedContent = (0, formatAsJavaScript_1.default)(translations, defaultLanguage);
    }
    else if (fileExtension === ".json") {
        formattedContent = (0, formatAsJSON_1.default)(translations);
    }
    else {
        throw new Error(`Unsupported file extension: ${fileExtension}`);
    }
    // Determine file path and extension
    const filePath = path_1.default.join(outputDir, `${defaultLanguage}${fileExtension}`);
    // Write the formatted content to the file
    fs_1.default.writeFileSync(filePath, formattedContent, "utf-8");
    console.log(`Generated primary language file: ${filePath}`);
};
exports.default = generatePrimaryLanguageFile;
