#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/cli/index.ts
var import_commander = require("commander");

// src/cli/loadConfig.ts
var import_fs = require("fs");
var import_path = __toESM(require("path"));
var loadConfig = (configPath = "./translateSheetConfig.js") => {
  if ((0, import_fs.existsSync)(configPath)) {
    try {
      const config = require(import_path.default.resolve(configPath));
      return config;
    } catch (error) {
      console.error(`Failed to load config file at ${configPath}:`, error);
      process.exit(1);
    }
  }
  return {};
};
var loadConfig_default = loadConfig;

// src/cli/extractTranslations.ts
var glob = __toESM(require("glob"));
var import_fs2 = __toESM(require("fs"));
var import_path2 = __toESM(require("path"));
var extractTranslations = () => {
  const files = glob.sync("**/*.{ts,tsx,js,jsx,mjs,cjs,json,mdx}");
  const translations = {};
  files.forEach((file) => {
    const filePath = import_path2.default.resolve(file);
    if (import_fs2.default.statSync(filePath).isDirectory()) {
      return;
    }
    const content = import_fs2.default.readFileSync(filePath, "utf-8");
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
var extractTranslations_default = extractTranslations;

// src/cli/generatePrimaryLanguageFile.ts
var import_fs3 = __toESM(require("fs"));
var import_path3 = __toESM(require("path"));

// src/helpers/formatAsJSON.ts
var formatAsJSON = (content2) => {
  return JSON.stringify(content2, null, 2);
};
var formatAsJSON_default = formatAsJSON;

// src/helpers/sanitizeLanguage.ts
var sanitizeLanguage = (lang) => lang.replace(/-/g, "_");
var sanitizeLanguage_default = sanitizeLanguage;

// src/helpers/formatAsJavaScript.ts
var formatAsJavaScript = (content2, targetLanguage) => {
  const sanitizedLanguage = sanitizeLanguage_default(targetLanguage);
  const formatObject = (obj, indent = 2) => {
    return Object.entries(obj).map(([key, value]) => {
      const formattedKey = key.includes("-") ? `"${key}"` : key;
      const formattedValue = typeof value === "object" && !Array.isArray(value) ? `{
${formatObject(value, indent + 2)}
${" ".repeat(indent)}}` : JSON.stringify(value);
      return `${" ".repeat(indent)}${formattedKey}: ${formattedValue},`;
    }).join("\n");
  };
  const objectString = formatObject(content2);
  return `const ${sanitizedLanguage} = {
${objectString}
};
export default ${sanitizedLanguage};`;
};
var formatAsJavaScript_default = formatAsJavaScript;

// src/helpers/formatAsTypeScript.ts
var formatAsTypeScript = (content2, targetLanguage) => {
  const sanitizedLanguage = sanitizeLanguage_default(targetLanguage);
  const formatObject = (obj, indent = 2) => {
    return Object.entries(obj).map(([key, value]) => {
      const formattedKey = key.includes("-") ? `"${key}"` : key;
      const formattedValue = typeof value === "object" && !Array.isArray(value) ? `{
${formatObject(value, indent + 2)}
${" ".repeat(indent)}}` : JSON.stringify(value);
      return `${" ".repeat(indent)}${formattedKey}: ${formattedValue},`;
    }).join("\n");
  };
  const objectString = formatObject(content2);
  return `const ${sanitizedLanguage}: Record<string, any> = {
${objectString}
};
export default ${sanitizedLanguage};`;
};
var formatAsTypeScript_default = formatAsTypeScript;

// src/cli/generatePrimaryLanguageFile.ts
var generatePrimaryLanguageFile = ({
  output,
  fileExtension,
  primaryLanguage,
  primaryLanguageTranslations
}) => {
  let formattedContent;
  if (fileExtension === ".ts") {
    formattedContent = formatAsTypeScript_default(primaryLanguageTranslations, primaryLanguage);
  } else if (fileExtension === ".js") {
    formattedContent = formatAsJavaScript_default(primaryLanguageTranslations, primaryLanguage);
  } else if (fileExtension === ".json") {
    formattedContent = formatAsJSON_default(primaryLanguageTranslations);
  } else {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }
  const filePath2 = import_path3.default.join(output, `${primaryLanguage}${fileExtension}`);
  import_fs3.default.writeFileSync(filePath2, formattedContent, "utf-8");
  console.log(`Generated primary language file: ${filePath2}`);
};
var generatePrimaryLanguageFile_default = generatePrimaryLanguageFile;

// src/cli/translateContent.ts
var translateContent = (_0) => __async(void 0, [_0], function* ({
  content: content2,
  targetLanguage,
  apiKey
}) {
  try {
    console.log("Sending translation request...");
    const response = yield fetch(
      "https://api.translatesheet.co/translate-content",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: content2,
          targetLanguage,
          apiKey
        })
      }
    );
    if (!response.ok) {
      const errorResponse = yield response.json();
      console.log(response.status);
      if (response.status === 403) {
        throw new Error(
          "API key is invalid or disabled. Please check your API key."
        );
      }
      if (response.status === 401) {
        throw new Error(
          "Unauthorized. Ensure your API key has the correct permissions."
        );
      }
      if (response.status === 400) {
        throw new Error(
          `Bad request: ${(errorResponse == null ? void 0 : errorResponse.error) || "Invalid request payload."}`
        );
      }
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${(errorResponse == null ? void 0 : errorResponse.error) || "Unexpected error."}`
      );
    }
    const data = yield response.json();
    return data.translatedContent;
  } catch (error) {
    console.error("Error translating content via API:", error);
    throw error;
  }
});
var translateContent_default = translateContent;

// src/cli/generateTranslatedFiles.ts
var import_fs4 = __toESM(require("fs"));
var import_path4 = __toESM(require("path"));

// src/cli/formatTranslatedContent.ts
var formatTranslatedContent = ({
  fileExtension,
  translatedContent,
  lang
}) => {
  let formattedContent;
  if (fileExtension === ".js") {
    formattedContent = formatAsJavaScript_default(translatedContent, lang);
  } else if (fileExtension === ".ts") {
    formattedContent = formatAsTypeScript_default(translatedContent, lang);
  } else if (fileExtension === ".json") {
    formattedContent = formatAsJSON_default(translatedContent);
  } else {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }
  return formattedContent;
};
var formatTranslatedContent_default = formatTranslatedContent;

// src/cli/generateTranslatedFiles.ts
var generateTranslatedFiles = (_0) => __async(void 0, [_0], function* ({
  output,
  primaryLanguageTranslations,
  primaryLanguage,
  languages,
  fileExtension,
  apiKey
}) {
  const sanitizedPrimaryLanguage = sanitizeLanguage_default(primaryLanguage);
  const imports = [
    `import ${sanitizedPrimaryLanguage} from "./${primaryLanguage}";`
  ];
  const resources = [
    `"${primaryLanguage}": ${sanitizedPrimaryLanguage}`
  ];
  for (const lang of languages) {
    const sanitizedLanguage = sanitizeLanguage_default(lang);
    console.log(`Translating content to ${lang}...`);
    try {
      const translatedContent = yield translateContent_default({
        content: primaryLanguageTranslations,
        targetLanguage: lang,
        apiKey
      });
      const formattedContent = formatTranslatedContent_default({
        fileExtension,
        translatedContent,
        lang
      });
      const filePath2 = import_path4.default.join(output, `${lang}${fileExtension}`);
      import_fs4.default.writeFileSync(filePath2, formattedContent, "utf-8");
      console.log(`Generated translation file: ${filePath2}`);
      imports.push(`import ${sanitizedLanguage} from "./${lang}";`);
      resources.push(`"${lang}": ${sanitizedLanguage}`);
    } catch (error) {
      console.error(`Failed to generate translation for ${lang}:`, error);
    }
  }
  const indexContent = `
${imports.join("\n")}

const resources = {
  ${resources.join(",\n  ")}
};

export default resources;
`;
  const indexFilePath = import_path4.default.join(output, `resources${fileExtension}`);
  import_fs4.default.writeFileSync(indexFilePath, indexContent, "utf-8");
  console.log(
    `Generated resources${fileExtension} file with all translations: ${indexFilePath}`
  );
});
var generateTranslatedFiles_default = generateTranslatedFiles;

// src/helpers/detectDuplicateNamespaces.ts
var detectDuplicateNamespaces = (translations2) => {
  const seenNamespaces = /* @__PURE__ */ new Set();
  const duplicateNamespaces = [];
  Object.keys(translations2).forEach((namespace2) => {
    if (seenNamespaces.has(namespace2)) {
      duplicateNamespaces.push(namespace2);
    }
    seenNamespaces.add(namespace2);
  });
  if (duplicateNamespaces.length > 0) {
    const message = `[TranslateSheet] Duplicate namespaces detected: ${duplicateNamespaces.join(
      ", "
    )}. Please ensure each namespace is unique.`;
    console.error(message);
    process.exit(1);
  }
};
var detectDuplicateNamespaces_default = detectDuplicateNamespaces;

// src/cli/index.ts
import_commander.program.command("generate").option("--output <output>", "Output directory", void 0).option("--primaryLanguage <primaryLanguage>", "Primary language", void 0).option(
  "--languages <languages>",
  "Comma-separated list of target languages",
  void 0
).option("--fileExtension <fileExtension>", "File extension", void 0).option("--apiKey <apiKey>", "OpenAI API key", void 0).option(
  "--config <config>",
  "Path to configuration file",
  "./translateSheetConfig.js"
).action((cmd) => __async(exports, null, function* () {
  const {
    output,
    primaryLanguage,
    languages,
    apiKey,
    fileExtension,
    config: configPath
  } = cmd;
  const config = loadConfig_default(configPath);
  const mergedConfig = {
    output: output || config.output || "./i18n",
    primaryLanguage: primaryLanguage || config.primaryLanguage || "en",
    languages: (languages == null ? void 0 : languages.split(",").map((lang) => lang.trim())) || config.languages || [],
    fileExtension: fileExtension || config.fileExtension || ".ts",
    apiKey: apiKey || config.apiKey
  };
  const {
    output: finalOutput,
    primaryLanguage: finalPrimaryLanguage,
    languages: finalLanguages,
    fileExtension: finalExtension,
    apiKey: finalApiKey
  } = mergedConfig;
  console.log("Extracting translations...");
  const primaryLanguageTranslations = extractTranslations_default();
  detectDuplicateNamespaces_default(primaryLanguageTranslations);
  console.log(`Generating primary language file (${finalPrimaryLanguage})...`);
  generatePrimaryLanguageFile_default({
    output: finalOutput,
    primaryLanguageTranslations,
    fileExtension: finalExtension,
    primaryLanguage: finalPrimaryLanguage
  });
  if (finalLanguages.length > 0) {
    if (!finalApiKey) {
      console.error(
        "API key is required. Provide it via config or CLI options."
      );
      process.exit(1);
    }
    console.log("Generating translations for target languages...");
    yield generateTranslatedFiles_default({
      output: finalOutput,
      primaryLanguageTranslations,
      primaryLanguage: finalPrimaryLanguage,
      languages: finalLanguages,
      fileExtension: finalExtension,
      apiKey: finalApiKey
    });
  }
}));
import_commander.program.parse(process.argv);
