import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import fs from "fs";
import path from "path";
import extractTranslateSheetObjects from "../src/helpers/extractTranslateSheetObjects";

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

describe("extractTranslateSheetObjects", () => {
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

    const result = extractTranslateSheetObjects();
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

    const result = extractTranslateSheetObjects();
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
      extractTranslateSheetObjects();
      // If extractTranslateSheetObjects doesn't call process.exit, fail the test
      expect("extractTranslateSheetObjects").toBe("should have exited but did not");
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

  it("should parse TS/JS/JSX/TSX files but only pick up valid TranslateSheet calls", () => {
    setupTestDirWithFiles({
      "someFile.tsx": `
        TranslateSheet.create("dashboard", {
          title: "Dashboard Title"
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

    const result = extractTranslateSheetObjects();
    expect(result).toEqual({
      dashboard: {
        title: "Dashboard Title",
        subTitle: "Subtitle from JSX",
      },
    });
  });

  it("should parse TS-specific syntax (as const, satisfies, parens) without choking", () => {
    setupTestDirWithFiles({
      "tsAsConst.ts": `
        type T = Record<string, string>;
        TranslateSheet.create("asConstNs", ({
          hello: "Hello",
          world: "World",
        } as const));
      `,
      "tsSatisfies.ts": `
        type T = Record<string, string>;
        TranslateSheet.create("satisfiesNs", {
          hi: "Hi",
        } satisfies T);
      `,
      "tsxFile.tsx": `
        const _Component = () => null;
        TranslateSheet.create("tsxNs", {
          label: "Click me",
          /* a block comment */
          nested: {
            "kebab-case-key": "with dash",
          },
        });
      `,
    });

    const result = extractTranslateSheetObjects();
    expect(result).toEqual({
      asConstNs: { hello: "Hello", world: "World" },
      satisfiesNs: { hi: "Hi" },
      tsxNs: {
        label: "Click me",
        "nested.kebab-case-key": "with dash",
      },
    });
  });

  it("should fail loudly when a translation value is not a string literal", () => {
    const originalError = console.error;
    const originalExit = process.exit;
    let capturedErrorMessage = "";
    let exitCode: number | undefined;

    console.error = (message: any) => {
      capturedErrorMessage = String(message);
    };
    process.exit = ((code?: number) => {
      exitCode = code;
      throw new Error("process.exit called");
    }) as typeof process.exit;

    setupTestDirWithFiles({
      "nonLiteral.ts": `
        const greeting = "Hello";
        TranslateSheet.create("ns", {
          greeting,
        });
      `,
    });

    try {
      extractTranslateSheetObjects();
      expect("did not exit").toBe("should have exited");
    } catch (err) {
      expect((err as Error).message).toBe("process.exit called");
    } finally {
      console.error = originalError;
      process.exit = originalExit;
    }

    expect(capturedErrorMessage).toContain("Translation values must be string literals");
    expect(capturedErrorMessage).toContain("nonLiteral.ts:");
    expect(exitCode).toBe(1);
  });

  it("should fail loudly when an object uses spread", () => {
    const originalError = console.error;
    const originalExit = process.exit;
    let capturedErrorMessage = "";

    console.error = (message: any) => {
      capturedErrorMessage = String(message);
    };
    process.exit = ((_code?: number) => {
      throw new Error("process.exit called");
    }) as typeof process.exit;

    setupTestDirWithFiles({
      "spread.ts": `
        const base = { foo: "bar" };
        TranslateSheet.create("ns", {
          ...base,
          hello: "Hello",
        });
      `,
    });

    try {
      extractTranslateSheetObjects();
      expect("did not exit").toBe("should have exited");
    } catch (err) {
      expect((err as Error).message).toBe("process.exit called");
    } finally {
      console.error = originalError;
      process.exit = originalExit;
    }

    expect(capturedErrorMessage).toContain("Spread (...) is not supported");
    expect(capturedErrorMessage).toContain("spread.ts:");
  });

  it("should fail loudly when the namespace is not a string literal", () => {
    const originalError = console.error;
    const originalExit = process.exit;
    let capturedErrorMessage = "";

    console.error = (message: any) => {
      capturedErrorMessage = String(message);
    };
    process.exit = ((_code?: number) => {
      throw new Error("process.exit called");
    }) as typeof process.exit;

    setupTestDirWithFiles({
      "dynNs.ts": `
        const NS = "common";
        TranslateSheet.create(NS, { hi: "Hi" });
      `,
    });

    try {
      extractTranslateSheetObjects();
      expect("did not exit").toBe("should have exited");
    } catch (err) {
      expect((err as Error).message).toBe("process.exit called");
    } finally {
      console.error = originalError;
      process.exit = originalExit;
    }

    expect(capturedErrorMessage).toContain("namespace must be a string literal");
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
    const result = extractTranslateSheetObjects();
    expect(result).toEqual({
      realNamespace: { realKey: "realValue" },
    });
  });

  it("should correctly flatten nested translation objects", () => {
    setupTestDirWithFiles({
      "nested.ts": `
        TranslateSheet.create("nestedNamespace", {
          header: "Header",
          body: {
            title: "Body Title",
            description: "Body Description",
            subSection: {
              detail: "Detail text"
            }
          },
          footer: "Footer"
        });
      `,
    });

    const result = extractTranslateSheetObjects();
    expect(result).toEqual({
      nestedNamespace: {
        header: "Header",
        "body.title": "Body Title",
        "body.description": "Body Description",
        "body.subSection.detail": "Detail text",
        footer: "Footer",
      },
    });
  });
});
