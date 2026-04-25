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

const countTranslated = (
  languageContent: Record<string, Record<string, string>> | undefined,
  expectedKeys: Array<{ namespace: string; key: string }>
): number => {
  if (!languageContent) return 0;
  let count = 0;
  for (const { namespace, key } of expectedKeys) {
    const ns = languageContent[namespace];
    if (ns && typeof ns[key] === "string" && ns[key].length > 0) count++;
  }
  return count;
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
  const total = expectedKeys.length;
  let lastCount = -1;
  let stalledPolls = 0;

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    await sleep(POLL_INTERVAL_MS);
    const all = await pullTranslationContent({ apiKey, silent: true });
    const languageContent = all?.[targetLanguage];
    const count = countTranslated(languageContent, expectedKeys);

    if (count === total && languageContent) {
      console.log(`✅ ${count}/${total} keys translated for ${targetLanguage}`);
      return languageContent;
    }

    if (count === lastCount) {
      stalledPolls++;
    } else {
      stalledPolls = 0;
      lastCount = count;
    }

    const stalledHint = stalledPolls > 0 ? ` (no progress in ${stalledPolls * (POLL_INTERVAL_MS / 1000)}s)` : "";
    console.log(`⏳ ${count}/${total} keys translated for ${targetLanguage}${stalledHint}...`);
  }

  throw new Error(
    `Timed out waiting for ${targetLanguage} translations after ${
      POLL_TIMEOUT_MS / 1000
    }s (last seen ${lastCount}/${total}). Run \`translate-sheet pull\` once the backend finishes, or check backend logs for errors.`
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
