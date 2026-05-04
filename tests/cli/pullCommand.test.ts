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
import { createPullCommand } from "../../src/cli/pullCommand";
import { mockFetch, type FetchHandler } from "../helpers/fetchMock";
import { mockProcessExit } from "../helpers/processExitMock";
import { createTempDir } from "../helpers/tempDir";

const tmp = createTempDir("pull-cmd");

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

describe("pullCommand", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let fetch: ReturnType<typeof mockFetch>;
  let exit: ReturnType<typeof mockProcessExit> | undefined;

  beforeEach(() => {
    tmp.reset();
    fs.mkdirSync(path.join(tmp.dir, "i18n"), { recursive: true });
  });

  afterEach(() => {
    fetch?.restore();
    exit?.restore();
    exit = undefined;
  });

  it("pulls translations and writes a file per non-primary language", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es", "fr"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
    });

    fetch = installFetch(() => ({
      status: 200,
      body: {
        success: true,
        data: {
          en: { common: { hi: "Hi" } },
          es: { common: { hi: "Hola" } },
          fr: { common: { hi: "Salut" } },
        },
      },
    }));

    await createPullCommand().parseAsync(["--config", cfg], { from: "user" });

    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.ts"))).toBe(false);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/es.ts"))).toBe(true);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/fr.ts"))).toBe(true);
    expect(fs.readFileSync(path.join(tmp.dir, "i18n/es.ts"), "utf-8")).toContain(
      "Hola"
    );
  });

  it("includes the primary file when generatePrimaryLanguageFile is true", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: true,
    });

    fetch = installFetch(() => ({
      status: 200,
      body: {
        success: true,
        data: {
          en: { common: { hi: "Hi" } },
          es: { common: { hi: "Hola" } },
        },
      },
    }));

    await createPullCommand().parseAsync(["--config", cfg], { from: "user" });

    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.ts"))).toBe(true);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/es.ts"))).toBe(true);
  });

  it("exits 1 when the backend pull fails", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
    });

    fetch = installFetch(() => ({
      status: 500,
      statusText: "Internal Server Error",
      body: { error: "boom" },
    }));
    exit = mockProcessExit();

    try {
      await createPullCommand().parseAsync(["--config", cfg], { from: "user" });
    } catch {
      // swallow — assertion is on the exit code
    }

    expect(exit.code).toBe(1);
  });
});
