import sanitizeLanguage from "./sanitizeLanguage";

/**
 * Generate a TypeScript object string with unquoted keys, except for keys with dashes, and add trailing commas.
 * Ensures that language codes with hyphens are converted to valid TypeScript variable names by replacing hyphens with underscores.
 */
const formatAsTypeScript = (
  content: Record<string, any>,
  targetLanguage: string
): string => {
  // Replace hyphens with underscores for the variable name
  const sanitizedLanguage = sanitizeLanguage(targetLanguage);

  const formatObject = (
    obj: Record<string, any>,
    indent: number = 2
  ): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        // Quote keys only if they contain a dash ("-")
        const formattedKey = key.includes("-") ? `"${key}"` : key;

        // Recursively format nested objects
        const formattedValue =
          typeof value === "object" && !Array.isArray(value)
            ? `{\n${formatObject(value, indent + 2)}\n${" ".repeat(indent)}}`
            : JSON.stringify(value);

        return `${" ".repeat(indent)}${formattedKey}: ${formattedValue},`; // Add trailing comma
      })
      .join("\n");
  };

  const objectString = formatObject(content);

  return `const ${sanitizedLanguage}: Record<string, any> = {\n${objectString}\n};\nexport default ${sanitizedLanguage};`;
};

export default formatAsTypeScript;
