import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  spyOn,
} from "bun:test";
import fs from "fs";
import path from "path";
import { createGenerateCommand } from "../../src/cli/generateCommand";
import { mockFetch, type FetchHandler } from "../helpers/fetchMock";
import { mockProcessExit } from "../helpers/processExitMock";
import { createTempDir } from "../helpers/tempDir";

const tmp = createTempDir("generate-cmd");

const installFetch = (handler: FetchHandler) => {
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "warn").mockImplementation(() => {});
  spyOn(console, "error").mockImplementation(() => {});
  return mockFetch(handler);
};

const writeConfig = (configBody: Record<string, unknown>) => {
  const name = `cfg-${Date.now()}-${Math.random().toString(36).slice(2)}.cjs`;
  fs.writeFileSync(
    path.join(tmp.dir, name),
    `module.exports = ${JSON.stringify(configBody)};`
  );
  return name;
};

let originalSetTimeout: typeof setTimeout;
const fastTimers = () => {
  originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = ((cb: any) => originalSetTimeout(cb, 0)) as any;
};
const restoreTimers = () => {
  if (originalSetTimeout) globalThis.setTimeout = originalSetTimeout;
};

describe("generateCommand", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let fetch: ReturnType<typeof mockFetch>;
  let exit: ReturnType<typeof mockProcessExit> | undefined;

  beforeEach(() => {
    tmp.reset();
    fs.mkdirSync(path.join(tmp.dir, "i18n"), { recursive: true });
    fastTimers();
  });

  afterEach(() => {
    fetch?.restore();
    exit?.restore();
    exit = undefined;
    restoreTimers();
  });

  it("runs the full pipeline: extract → types → upload primary → request languages → write files", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Component.tsx"),
      `TranslateSheet.create("common", { hi: "Hi" });`
    );

    fetch = installFetch(({ url }) => {
      if (url.pathname === "/translations/upload") {
        return { status: 200, body: {} };
      }
      if (url.pathname === "/translations/translate") {
        return { status: 202, body: {} };
      }
      if (url.pathname === "/translations/pull-translations") {
        return {
          status: 200,
          body: {
            success: true,
            data: { es: { common: { hi: "Hola" } } },
          },
        };
      }
      throw new Error(`unexpected fetch to ${url.pathname}`);
    });

    await createGenerateCommand().parseAsync(["--config", cfg], {
      from: "user",
    });

    // 1. Types file generated
    expect(fs.existsSync(path.join(tmp.dir, "i18n/translations.types.ts"))).toBe(
      true
    );

    // 2. Primary content uploaded
    const uploadCalls = fetch.calls.filter(
      (c) => c.url.pathname === "/translations/upload"
    );
    expect(uploadCalls).toHaveLength(1);
    expect(uploadCalls[0].body.targetLanguage).toBe("en");
    expect(uploadCalls[0].body.isPrimary).toBe(true);

    // 3. Per-language file written
    expect(fs.existsSync(path.join(tmp.dir, "i18n/es.ts"))).toBe(true);

    // 4. Resources index emitted
    expect(fs.existsSync(path.join(tmp.dir, "i18n/resources.ts"))).toBe(true);
  });

  it("skips the types file when fileExtension is not .ts", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".json",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Component.tsx"),
      `TranslateSheet.create("common", { hi: "Hi" });`
    );

    fetch = installFetch(() => ({ status: 200, body: {} }));

    await createGenerateCommand().parseAsync(["--config", cfg], {
      from: "user",
    });

    expect(
      fs.existsSync(path.join(tmp.dir, "i18n/translations.types.ts"))
    ).toBe(false);
  });

  it("writes the primary language file when generatePrimaryLanguageFile is true", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: true,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Component.tsx"),
      `TranslateSheet.create("common", { hi: "Hi" });`
    );

    fetch = installFetch(() => ({ status: 200, body: {} }));

    await createGenerateCommand().parseAsync(["--config", cfg], {
      from: "user",
    });

    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.ts"))).toBe(true);
  });

  it("exits 1 if the primary upload fails", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Component.tsx"),
      `TranslateSheet.create("common", { hi: "Hi" });`
    );

    fetch = installFetch(() => ({
      status: 500,
      statusText: "Internal Server Error",
      body: { error: "boom" },
    }));
    exit = mockProcessExit();

    try {
      await createGenerateCommand().parseAsync(["--config", cfg], {
        from: "user",
      });
    } catch {
      // swallow — assertion is on the exit code
    }

    expect(exit.code).toBe(1);
  });
});
