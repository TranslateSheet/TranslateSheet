"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generate a JavaScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 */
const formatAsJavaScript = (content, targetLanguage) => {
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
    return `const ${targetLanguage} = {\n${objectString}\n};\nexport default ${targetLanguage};`;
};
exports.default = formatAsJavaScript;
