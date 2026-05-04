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
import { createPushCommand } from "../../src/cli/pushCommand";
import { mockFetch, type FetchHandler } from "../helpers/fetchMock";
import { mockProcessExit } from "../helpers/processExitMock";
import { createTempDir } from "../helpers/tempDir";

const tmp = createTempDir("push-cmd");

const installFetch = (handler: FetchHandler) => {
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "warn").mockImplementation(() => {});
  spyOn(console, "error").mockImplementation(() => {});
  return mockFetch(handler);
};

// Each test must use a unique config filename. Node's ESM module cache keys
// imports by URL, so reusing `translateSheetConfig.js` across tests would
// silently return the previous test's module body.
const writeConfig = (configBody: Record<string, unknown>) => {
  const name = `cfg-${Date.now()}-${Math.random().toString(36).slice(2)}.cjs`;
  fs.writeFileSync(
    path.join(tmp.dir, name),
    `module.exports = ${JSON.stringify(configBody)};`
  );
  return name;
};

describe("pushCommand", () => {
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

  it("uploads the extracted primary content for the primary language", async () => {
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

    fetch = installFetch(() => ({ status: 200, body: {} }));

    await createPushCommand().parseAsync(["--config", cfg], { from: "user" });

    const uploads = fetch.calls.filter(
      (c) => c.url.pathname === "/translations/upload"
    );
    expect(uploads).toHaveLength(1);
    expect(uploads[0].body.targetLanguage).toBe("en");
    expect(uploads[0].body.isPrimary).toBe(true);
    expect(uploads[0].body.content).toEqual({ common: { hi: "Hi" } });
  });

  it("uploads each non-primary language from its on-disk file", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".json",
      apiKey: "ak",
      generatePrimaryLanguageFile: true,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Component.tsx"),
      `TranslateSheet.create("common", { hi: "Hi" });`
    );
    fs.writeFileSync(
      path.join(tmp.dir, "i18n/en.json"),
      JSON.stringify({ common: { hi: "Hi" } })
    );
    fs.writeFileSync(
      path.join(tmp.dir, "i18n/es.json"),
      JSON.stringify({ common: { hi: "Hola" } })
    );

    fetch = installFetch(() => ({ status: 200, body: {} }));

    await createPushCommand().parseAsync(["--config", cfg], { from: "user" });

    const uploads = fetch.calls.filter(
      (c) => c.url.pathname === "/translations/upload"
    );
    expect(uploads).toHaveLength(2);
    const byLang = Object.fromEntries(
      uploads.map((u) => [u.body.targetLanguage, u.body])
    );
    expect(byLang.en.isPrimary).toBe(true);
    expect(byLang.en.content).toEqual({ common: { hi: "Hi" } });
    expect(byLang.es.isPrimary).toBe(false);
    expect(byLang.es.content).toEqual({ common: { hi: "Hola" } });
  });

  it("exits 1 when apiKey is missing", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".ts",
      generatePrimaryLanguageFile: false,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Component.tsx"),
      `TranslateSheet.create("common", { hi: "Hi" });`
    );

    fetch = installFetch(() => ({ status: 200, body: {} }));
    exit = mockProcessExit();

    // commander's parseAsync may or may not propagate action throws
    // consistently across versions, so we assert against the exit-mock state
    // directly rather than rejecting the parseAsync promise.
    try {
      await createPushCommand().parseAsync(["--config", cfg], { from: "user" });
    } catch {
      // swallow — we only care that the exit was triggered with code 1
    }

    expect(exit.code).toBe(1);
  });
});
