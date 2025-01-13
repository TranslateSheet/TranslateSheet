#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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

// src/cli/loadConfig.ts
import { existsSync } from "fs";
import path from "path";
var loadConfig, loadConfig_default;
var init_loadConfig = __esm({
  "src/cli/loadConfig.ts"() {
    "use strict";
    loadConfig = (configPath = "./translateSheetConfig.js") => {
      if (existsSync(configPath)) {
        try {
          const config = __require(path.resolve(configPath));
          return config;
        } catch (error) {
          console.error(`Failed to load config file at ${configPath}:`, error);
          process.exit(1);
        }
      }
      return {};
    };
    loadConfig_default = loadConfig;
  }
});

// src/cli/extractTranslations.ts
import * as glob from "glob";
import fs from "fs";
import path2 from "path";
var extractTranslations, extractTranslations_default;
var init_extractTranslations = __esm({
  "src/cli/extractTranslations.ts"() {
    "use strict";
    extractTranslations = () => {
      const files = glob.sync("**/*.{ts,tsx,js,jsx,mjs,cjs,json,mdx}");
      const translations = {};
      files.forEach((file) => {
        const filePath = path2.resolve(file);
        if (fs.statSync(filePath).isDirectory()) {
          return;
        }
        const content = fs.readFileSync(filePath, "utf-8");
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
    extractTranslations_default = extractTranslations;
  }
});

// src/helpers/formatAsJSON.ts
var formatAsJSON, formatAsJSON_default;
var init_formatAsJSON = __esm({
  "src/helpers/formatAsJSON.ts"() {
    "use strict";
    formatAsJSON = (content2) => {
      return JSON.stringify(content2, null, 2);
    };
    formatAsJSON_default = formatAsJSON;
  }
});

// src/helpers/sanitizeLanguage.ts
var sanitizeLanguage, sanitizeLanguage_default;
var init_sanitizeLanguage = __esm({
  "src/helpers/sanitizeLanguage.ts"() {
    "use strict";
    sanitizeLanguage = (lang) => lang.replace(/-/g, "_");
    sanitizeLanguage_default = sanitizeLanguage;
  }
});

// src/helpers/formatAsJavaScript.ts
var formatAsJavaScript, formatAsJavaScript_default;
var init_formatAsJavaScript = __esm({
  "src/helpers/formatAsJavaScript.ts"() {
    "use strict";
    init_sanitizeLanguage();
    formatAsJavaScript = (content2, targetLanguage) => {
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
    formatAsJavaScript_default = formatAsJavaScript;
  }
});

// src/helpers/formatAsTypeScript.ts
var formatAsTypeScript, formatAsTypeScript_default;
var init_formatAsTypeScript = __esm({
  "src/helpers/formatAsTypeScript.ts"() {
    "use strict";
    init_sanitizeLanguage();
    formatAsTypeScript = (content2, targetLanguage) => {
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
    formatAsTypeScript_default = formatAsTypeScript;
  }
});

// src/cli/generatePrimaryLanguageFile.ts
import fs2 from "fs";
import path3 from "path";
var generatePrimaryLanguageFile, generatePrimaryLanguageFile_default;
var init_generatePrimaryLanguageFile = __esm({
  "src/cli/generatePrimaryLanguageFile.ts"() {
    "use strict";
    init_formatAsJSON();
    init_formatAsJavaScript();
    init_formatAsTypeScript();
    generatePrimaryLanguageFile = ({
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
      const filePath2 = path3.join(output, `${primaryLanguage}${fileExtension}`);
      fs2.writeFileSync(filePath2, formattedContent, "utf-8");
      console.log(`Generated primary language file: ${filePath2}`);
    };
    generatePrimaryLanguageFile_default = generatePrimaryLanguageFile;
  }
});

// src/cli/translateContent.ts
var translateContent, translateContent_default;
var init_translateContent = __esm({
  "src/cli/translateContent.ts"() {
    "use strict";
    translateContent = (_0) => __async(void 0, [_0], function* ({
      content: content2,
      targetLanguage,
      apiKey
    }) {
      try {
        console.log("Sending translation request...");
        const response = yield fetch(
          "https://api.translatesheet.co/api/translations",
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
    translateContent_default = translateContent;
  }
});

// src/cli/formatTranslatedContent.ts
var formatTranslatedContent, formatTranslatedContent_default;
var init_formatTranslatedContent = __esm({
  "src/cli/formatTranslatedContent.ts"() {
    "use strict";
    init_formatAsJSON();
    init_formatAsJavaScript();
    init_formatAsTypeScript();
    formatTranslatedContent = ({
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
    formatTranslatedContent_default = formatTranslatedContent;
  }
});

// src/cli/generateTranslatedFiles.ts
import fs3 from "fs";
import path4 from "path";
var generateTranslatedFiles, generateTranslatedFiles_default;
var init_generateTranslatedFiles = __esm({
  "src/cli/generateTranslatedFiles.ts"() {
    "use strict";
    init_translateContent();
    init_sanitizeLanguage();
    init_formatTranslatedContent();
    generateTranslatedFiles = (_0) => __async(void 0, [_0], function* ({
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
          const filePath2 = path4.join(output, `${lang}${fileExtension}`);
          fs3.writeFileSync(filePath2, formattedContent, "utf-8");
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
      const indexFilePath = path4.join(output, `resources${fileExtension}`);
      fs3.writeFileSync(indexFilePath, indexContent, "utf-8");
      console.log(
        `Generated resources${fileExtension} file with all translations: ${indexFilePath}`
      );
    });
    generateTranslatedFiles_default = generateTranslatedFiles;
  }
});

// src/helpers/detectDuplicateNamespaces.ts
var detectDuplicateNamespaces, detectDuplicateNamespaces_default;
var init_detectDuplicateNamespaces = __esm({
  "src/helpers/detectDuplicateNamespaces.ts"() {
    "use strict";
    detectDuplicateNamespaces = (translations2) => {
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
    detectDuplicateNamespaces_default = detectDuplicateNamespaces;
  }
});

// src/cli/index.ts
import { program } from "commander";
var require_cli = __commonJS({
  "src/cli/index.ts"(exports) {
    init_loadConfig();
    init_extractTranslations();
    init_generatePrimaryLanguageFile();
    init_generateTranslatedFiles();
    init_detectDuplicateNamespaces();
    program.command("generate").option("--output <output>", "Output directory", void 0).option("--primaryLanguage <primaryLanguage>", "Primary language", void 0).option(
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
    program.parse(process.argv);
  }
});
export default require_cli();
