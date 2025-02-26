import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import fs from "fs";
import path from "path";

import { TranslateSheetConfig } from "../src/types";
import { getMergedConfig } from "../src/cli/getMergedConfig";

const TEST_DIR = path.join(process.cwd(), "test-temp-dir");
let originalCwd: string;

function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Sets up a test configuration file in the test directory.
 */
function setupTestConfig(fileMap: Record<string, string>) {
  ensureDirExists(TEST_DIR);
  // Clear out any existing files
  const existingEntries = fs.readdirSync(TEST_DIR);
  for (const entry of existingEntries) {
    fs.rmSync(path.join(TEST_DIR, entry), { recursive: true, force: true });
  }
  // Write the provided files
  for (const relativePath of Object.keys(fileMap)) {
    const fullPath = path.join(TEST_DIR, relativePath);
    ensureDirExists(path.dirname(fullPath));
    fs.writeFileSync(fullPath, fileMap[relativePath]);
  }
}

describe("getMergedConfig", () => {
  beforeAll(() => {
    originalCwd = process.cwd();
    ensureDirExists(TEST_DIR);
    process.chdir(TEST_DIR);
  });

  afterAll(() => {
    process.chdir(originalCwd);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should merge CLI options over file config", async () => {
    const testConfigPath = "test-config.js";
    setupTestConfig({
      [testConfigPath]: `
        module.exports = {
          output: "./defaultOutput",
          primaryLanguage: "es",
          languages: ["fr", "de"],
          fileExtension: ".js",
          apiKey: "defaultApiKey",
          generatePrimaryLanguageFile: false
        };
      `,
    });

    // Provide CLI options that override file config values.
    const cliOptions = {
      config: testConfigPath,
      output: "./cliOutput",
      primaryLanguage: "en",
      languages: "ja, ko", // comma-separated string
      fileExtension: ".ts",
      apiKey: "cliApiKey",
      generatePrimaryLanguageFile: "true",
    } as Partial<TranslateSheetConfig> & {
      config?: string;
      languages?: string;
      generatePrimaryLanguageFile?: string | boolean;
    };

    const merged = await getMergedConfig(cliOptions);
    expect(merged).toEqual({
      output: "./cliOutput",
      primaryLanguage: "en",
      languages: ["ja", "ko"],
      fileExtension: ".ts",
      apiKey: "cliApiKey",
      generatePrimaryLanguageFile: true,
    });
  });

  it("should use file config when CLI options are not provided", async () => {
    const testConfigPath = "test-config.js";
    setupTestConfig({
      [testConfigPath]: `
        module.exports = {
          output: "./defaultOutput",
          primaryLanguage: "es",
          languages: ["fr", "de"],
          fileExtension: ".js",
          apiKey: "defaultApiKey",
          generatePrimaryLanguageFile: true
        };
      `,
    });

    // With no CLI overrides, file config should be used.
    const cliOptions = { config: testConfigPath } as Partial<TranslateSheetConfig> & {
      config?: string;
      languages?: string;
      generatePrimaryLanguageFile?: string | boolean;
    };

    const merged = await getMergedConfig(cliOptions);
    expect(merged).toEqual({
      output: "./defaultOutput",
      primaryLanguage: "es",
      languages: ["fr", "de"],
      fileExtension: ".js",
      apiKey: "defaultApiKey",
      generatePrimaryLanguageFile: true,
    });
  });

  it("should fallback to defaults when neither CLI nor file config provides a value", async () => {
    const testConfigPath = "empty-config.js";
    setupTestConfig({
      [testConfigPath]: `
        module.exports = {};
      `,
    });

    const cliOptions = { config: testConfigPath } as Partial<TranslateSheetConfig> & {
      config?: string;
      languages?: string;
      generatePrimaryLanguageFile?: string | boolean;
    };

    const merged = await getMergedConfig(cliOptions);
    expect(merged).toEqual({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".ts",
      apiKey: undefined as any,
      generatePrimaryLanguageFile: false,
    });
  });

  it("should correctly interpret the generatePrimaryLanguageFile flag", async () => {
    const testConfigPath = "config-with-gen.js";
    setupTestConfig({
      [testConfigPath]: `
        module.exports = {
          generatePrimaryLanguageFile: false
        };
      `,
    });

    // Test with CLI option as boolean true.
    let merged = await getMergedConfig({
      config: testConfigPath,
      generatePrimaryLanguageFile: true,
    } as Partial<TranslateSheetConfig> & {
      config?: string;
      languages?: string;
      generatePrimaryLanguageFile?: string | boolean;
    });
    expect(merged.generatePrimaryLanguageFile).toBe(true);

    // Test with CLI option as string "true".
    merged = await getMergedConfig({
      config: testConfigPath,
      generatePrimaryLanguageFile: "true",
    } as Partial<TranslateSheetConfig> & {
      config?: string;
      languages?: string;
      generatePrimaryLanguageFile?: string | boolean;
    });
    expect(merged.generatePrimaryLanguageFile).toBe(true);

    // Test with CLI option as boolean false.
    merged = await getMergedConfig({
      config: testConfigPath,
      generatePrimaryLanguageFile: false,
    } as Partial<TranslateSheetConfig> & {
      config?: string;
      languages?: string;
      generatePrimaryLanguageFile?: string | boolean;
    });
    expect(merged.generatePrimaryLanguageFile).toBe(false);
  });
});
