"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeLanguage_1 = __importDefault(require("./sanitizeLanguage"));
/**
 * Generate a JavaScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 * Ensures that language codes with hyphens are converted to valid JavaScript variable names by replacing hyphens with underscores.
 */
const formatAsJavaScript = (content, targetLanguage) => {
    // Replace hyphens with underscores for the variable name
    const sanitizedLanguage = (0, sanitizeLanguage_1.default)(targetLanguage);
    const formatObject = (obj, indent = 2) => {
        return Object.entries(obj)
            .map(([key, value]) => {
            // Quote keys only if they contain a dash ("-")
            const formattedKey = key.includes("-") ? `"${key}"` : key;
            // Recursively format nested objects
            const formattedValue = typeof value === "object" && !Array.isArray(value)
                ? `{\n${formatObject(value, indent + 2)}\n${" ".repeat(indent)}}`
                : JSON.stringify(value);
            return `${" ".repeat(indent)}${formattedKey}: ${formattedValue},`; // Add trailing comma
        })
            .join("\n");
    };
    const objectString = formatObject(content);
    return `const ${sanitizedLanguage} = {\n${objectString}\n};\nexport default ${sanitizedLanguage};`;
};
exports.default = formatAsJavaScript;
