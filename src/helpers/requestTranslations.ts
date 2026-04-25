import sendTranslationRequest from "../api/sendTranslationRequest";
import { pullTranslationContent } from "../api/pullTranslationContent";
import fs from "fs";
import path from "path";
import { TranslateSheetConfig } from "../types";
import sanitizeLanguage from "./sanitizeLanguage";
import formatTranslatedContent from "./formatTranslatedContent";
import flattenContent from "./flattenContent";

const POLL_INTERVAL_MS = 5_000;
const POLL_TIMEOUT_MS = 5 * 60_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isLanguageComplete = (
  languageContent: Record<string, Record<string, string>> | undefined,
  expectedKeys: Array<{ namespace: string; key: string }>
): boolean => {
  if (!languageContent) return false;
  for (const { namespace, key } of expectedKeys) {
    const ns = languageContent[namespace];
    if (!ns || typeof ns[key] !== "string" || ns[key].length === 0) {
      return false;
    }
  }
  return true;
};

const waitForLanguage = async ({
  apiKey,
  targetLanguage,
  expectedKeys,
}: {
  apiKey: string;
  targetLanguage: string;
  expectedKeys: Array<{ namespace: string; key: string }>;
}): Promise<Record<string, Record<string, string>>> => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);
    const all = await pullTranslationContent({ apiKey });
    const languageContent = all?.[targetLanguage];
    if (isLanguageComplete(languageContent, expectedKeys)) {
      return languageContent;
    }
    console.log(`⏳ Waiting for ${targetLanguage} translations to complete...`);
  }

  throw new Error(
    `Timed out waiting for ${targetLanguage} translations after ${
      POLL_TIMEOUT_MS / 1000
    }s. Run \`translate-sheet pull\` once the backend finishes to retrieve them.`
  );
};

/**
 * Request translated files for target languages from BE service
 */
const requestTranslations = async ({
  output,
  primaryLanguageContent,
  primaryLanguage,
  languages,
  fileExtension,
  apiKey,
  generatePrimaryLanguageFile,
}: TranslateSheetConfig & {
  primaryLanguageContent: Record<string, any>;
}): Promise<void> => {
  let imports: string[] = [];
  let resources: string[] = [];

  const shouldWritePrimary =
    generatePrimaryLanguageFile === true ||
    generatePrimaryLanguageFile === "true";

  if (shouldWritePrimary) {
    const sanitizedPrimaryLanguage = sanitizeLanguage(primaryLanguage);
    imports = [
      `import ${sanitizedPrimaryLanguage} from "./${primaryLanguage}";`,
    ];
    resources = [`"${primaryLanguage}": ${sanitizedPrimaryLanguage}`];
  } else {
    resources = [`"${primaryLanguage}": { language: "isPrimary" }`];
  }

  const expectedKeys = flattenContent(primaryLanguageContent);

  const uniqueLanguages = Array.from(new Set(languages));
  for (const targetLanguage of uniqueLanguages) {
    const sanitizedLanguage = sanitizeLanguage(targetLanguage);
    console.log(`🌍 Translating content to ${targetLanguage}...`);
    try {
      await sendTranslationRequest({
        content: primaryLanguageContent,
        targetLanguage,
        apiKey,
      });

      const translatedContent = await waitForLanguage({
        apiKey,
        targetLanguage,
        expectedKeys,
      });

      const formattedContent = formatTranslatedContent({
        fileExtension,
        translatedContent,
        targetLanguage,
      });

      const filePath = path.join(output, `${targetLanguage}${fileExtension}`);
      fs.writeFileSync(filePath, formattedContent, "utf-8");
      console.log(`✅ Generated translation file: ${filePath}`);

      imports.push(`import ${sanitizedLanguage} from "./${targetLanguage}";`);
      resources.push(`"${targetLanguage}": ${sanitizedLanguage}`);
    } catch (error) {
      console.error(
        `❌ Failed to generate translation for ${targetLanguage}:`,
        error
      );
    }
  }

  // Generate index.ts with dynamic imports and resource object
  const indexContent = `
${imports.join("\n")}

const resources = {
  ${resources.join(",\n  ")}
};

export default resources;
`;

  const indexFilePath = path.join(
    output,
    `resources${fileExtension === ".ts" ? ".ts" : ".js"}`
  );
  fs.writeFileSync(indexFilePath, indexContent, "utf-8");
  console.log(
    `📦 Generated resources${fileExtension} file with all translations: ${indexFilePath}`
  );
};

export default requestTranslations;
