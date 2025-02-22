import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import fs from "fs";
import path from "path";
import extractTranslations from "../helpers/extractTranslations";


function ensureDirExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

const TEST_DIR = path.join(process.cwd(), "test-temp-dir");
let originalCwd: string;

/**
 * Setup a clean test directory with the given files in subdirectories if needed.
 * Also sets our `process.cwd()` to that directory so the globbing paths line up.
 *
 * Returns a cleanup function to restore the environment afterward.
 */
function setupTestDirWithFiles(fileMap: Record<string, string>) {
  // 1. Create a fresh test directory
  ensureDirExists(TEST_DIR);

  // 2. Clear out any leftover files from previous tests
  const existingEntries = fs.readdirSync(TEST_DIR);
  for (const entry of existingEntries) {
    fs.rmSync(path.join(TEST_DIR, entry), { recursive: true, force: true });
  }

  // 3. Write the test files
  for (const relativePath of Object.keys(fileMap)) {
    const fullPath = path.join(TEST_DIR, relativePath);
    ensureDirExists(path.dirname(fullPath));
    fs.writeFileSync(fullPath, fileMap[relativePath]);
  }
}

describe("extractTranslations", () => {
  beforeAll(() => {
    originalCwd = process.cwd();
    // Move into our test directory to keep the glob paths consistent
    ensureDirExists(TEST_DIR);
    process.chdir(TEST_DIR);
  });

  afterAll(() => {
    // Cleanup test directory
    process.chdir(originalCwd);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it("should extract translations from multiple files and group them by namespace", () => {
    setupTestDirWithFiles({
      "file1.ts": `
        TranslateSheet.create("common", {
          hello: "Hello",
          world: "World"
        });
      `,
      "file2.ts": `
        TranslateSheet.create("auth", {
          login: "Login",
          logout: "Logout"
        });
      `,
    });

    const result = extractTranslations();
    expect(result).toEqual({
      common: { hello: "Hello", world: "World" },
      auth: { login: "Login", logout: "Logout" },
    });
  });

  it("should return an empty object when no TranslateSheet.create calls exist", () => {
    setupTestDirWithFiles({
      "no-translate.ts": `
        // A file that has zero references to TranslateSheet
        console.log("Nothing here!");
      `,
      "anotherFile.js": `
        // Another file with absolutely no translations
        function foo() { return "bar"; }
      `,
    });

    const result = extractTranslations();
    expect(result).toEqual({});
  });

  it("should detect duplicate keys and call process.exit(1)", () => {
    // We’ll intercept console.error and process.exit to verify they were called
    const originalError = console.error;
    const originalExit = process.exit;
    let capturedErrorMessage = "";
    let exitCode: number | undefined;

    console.error = (message: any) => {
      capturedErrorMessage = message;
    };
    process.exit = (code?: number) => {
      exitCode = code;
      // We don't actually want to kill the test process,
      // so throw an error to break out of the function early
      throw new Error("process.exit called");
    };

    setupTestDirWithFiles({
      "fileWithDuplicates.ts": `
        TranslateSheet.create("common", {
          hello: "Hello",
          world: "World"
        });

        // Another place with the same key "hello"
        TranslateSheet.create("common", {
          hello: "Hola"
        });
      `,
    });

    try {
      extractTranslations();
      // If extractTranslations doesn't call process.exit, fail the test
      expect("extractTranslations").toBe("should have exited but did not");
    } catch (err) {
      // We expect "process.exit called"
      expect((err as Error).message).toBe("process.exit called");
    } finally {
      // Restore original methods
      console.error = originalError;
      process.exit = originalExit;
    }

    // Validate the error message and exit code
    expect(capturedErrorMessage).toContain('Duplicate key detected');
    expect(exitCode).toBe(1);
  });

  it("should parse TS/JS/MDX/JSON files but only pick up valid TranslateSheet calls", () => {
    setupTestDirWithFiles({
      "someFile.tsx": `
        TranslateSheet.create("dashboard", {
          title: "Dashboard Title"
        });
      `,
      "someFile.mdx": `
        // In MDX we might have embedded code, as long as it matches the regex
        TranslateSheet.create("marketing", {
          slogan: "Buy Our Stuff"
        });
      `,
      "random.json": `
        {
          "notATranslateSheet": "value"
        }
      `,
      "anotherFile.jsx": `
        // This one also has a valid usage
        TranslateSheet.create("dashboard", {
          subTitle: "Subtitle from JSX"
        });
      `
    });

    const result = extractTranslations();
    expect(result).toEqual({
      dashboard: {
        title: "Dashboard Title",
        subTitle: "Subtitle from JSX",
      },
      marketing: {
        slogan: "Buy Our Stuff",
      },
    });
  });

  it("should skip directories and ignore node_modules/dist/build (no error or data)", () => {
    // Create a directory that theoretically should be skipped
    setupTestDirWithFiles({
      "node_modules/testPackage/index.js": `
        TranslateSheet.create("badNamespace", { foo: "bar" });
      `,
      "dist/bundle.js": `
        TranslateSheet.create("distNamespace", { key: "value" });
      `,
      "build/something.js": `
        TranslateSheet.create("buildNamespace", { key2: "value2" });
      `,
      "myFolder/someFile.js": `
        // A real file that *will* be parsed
        TranslateSheet.create("realNamespace", { realKey: "realValue" });
      `,
    });

    // The code sets ignore patterns for node_modules, dist, build
    const result = extractTranslations();
    expect(result).toEqual({
      realNamespace: { realKey: "realValue" },
    });
  });
});
