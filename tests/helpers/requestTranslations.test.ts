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
import requestTranslations from "../../src/helpers/requestTranslations";
import { mockFetch, type FetchHandler } from "./fetchMock";
import { createTempDir } from "./tempDir";

const tmp = createTempDir("request-translations");

// The orchestrator polls every 5s with a 5-min timeout. To keep the suite
// fast we collapse all setTimeout delays to 0ms — the polling loop runs
// effectively as fast as the fetch handler can respond, while every other
// timer-dependent code path still works correctly.
let originalSetTimeout: typeof setTimeout;
const fastTimers = () => {
  originalSetTimeout = globalThis.setTimeout;
  globalThis.setTimeout = ((cb: any) => originalSetTimeout(cb, 0)) as any;
};
const restoreTimers = () => {
  if (originalSetTimeout) globalThis.setTimeout = originalSetTimeout;
};

const installFetch = (handler: FetchHandler) => {
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "error").mockImplementation(() => {});
  return mockFetch(handler);
};

describe("requestTranslations", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let fetch: ReturnType<typeof mockFetch>;

  beforeEach(() => {
    tmp.reset();
    fs.mkdirSync(path.join(tmp.dir, "i18n"), { recursive: true });
    fastTimers();
  });

  afterEach(() => {
    fetch?.restore();
    restoreTimers();
  });

  it("skips the translate API call when every key already exists for a language", async () => {
    fetch = installFetch(({ url }) => {
      if (url.pathname === "/translations/pull-translations") {
        return {
          status: 200,
          body: {
            success: true,
            data: {
              es: { common: { hi: "Hola", bye: "Adios" } },
            },
          },
        };
      }
      throw new Error(`unexpected fetch to ${url.pathname}`);
    });

    await requestTranslations({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
      primaryLanguageContent: {
        common: { hi: "Hi", bye: "Bye" },
      },
    });

    // No /translate POST should have happened — only the initial pull.
    const translateCalls = fetch.calls.filter(
      (c) => c.url.pathname === "/translations/translate"
    );
    expect(translateCalls).toHaveLength(0);

    // The es file should be written from the existing (already-cached) data.
    const esPath = path.join(tmp.dir, "i18n/es.ts");
    expect(fs.existsSync(esPath)).toBe(true);
    expect(fs.readFileSync(esPath, "utf-8")).toContain("Hola");

    // The resources index file should also be generated.
    expect(fs.existsSync(path.join(tmp.dir, "i18n/resources.ts"))).toBe(true);
  });

  it("sends only the missing-key subset to the translate endpoint", async () => {
    let pullCount = 0;
    fetch = installFetch(({ url }) => {
      if (url.pathname === "/translations/translate") {
        return { status: 202, body: {} };
      }
      if (url.pathname === "/translations/pull-translations") {
        pullCount++;
        // First call: existing translations check (es has only `hi`).
        // Subsequent polls: gradually reveal the new key.
        if (pullCount === 1) {
          return {
            status: 200,
            body: {
              success: true,
              data: { es: { common: { hi: "Hola" } } },
            },
          };
        }
        return {
          status: 200,
          body: {
            success: true,
            data: { es: { common: { hi: "Hola", bye: "Adios" } } },
          },
        };
      }
      throw new Error(`unexpected fetch to ${url.pathname}`);
    });

    await requestTranslations({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
      primaryLanguageContent: { common: { hi: "Hi", bye: "Bye" } },
    });

    const translateCall = fetch.calls.find(
      (c) => c.url.pathname === "/translations/translate"
    );
    expect(translateCall).toBeDefined();
    // Only the missing key (`bye`) should be in the subset, not `hi`.
    expect(translateCall!.body.content).toEqual({ common: { bye: "Bye" } });
    expect(translateCall!.body.targetLanguage).toBe("es");
  });

  it("emits a resources file that imports the primary lang only when shouldWritePrimary is on", async () => {
    fetch = installFetch(({ url }) => {
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

    await requestTranslations({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: true,
      primaryLanguageContent: { common: { hi: "Hi" } },
    });

    const resources = fs.readFileSync(
      path.join(tmp.dir, "i18n/resources.ts"),
      "utf-8"
    );
    expect(resources).toContain('import en from "./en"');
    expect(resources).toContain('import es from "./es"');
    expect(resources).toContain('"en": en');
    expect(resources).toContain('"es": es');
  });

  it("emits a placeholder primary entry when shouldWritePrimary is off", async () => {
    fetch = installFetch(({ url }) => {
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

    await requestTranslations({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
      primaryLanguageContent: { common: { hi: "Hi" } },
    });

    const resources = fs.readFileSync(
      path.join(tmp.dir, "i18n/resources.ts"),
      "utf-8"
    );
    expect(resources).not.toContain('import en from "./en"');
    expect(resources).toContain('"en": { language: "isPrimary" }');
  });

  it("deduplicates the languages list", async () => {
    fetch = installFetch(({ url }) => {
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

    await requestTranslations({
      output: "./i18n",
      primaryLanguage: "en",
      languages: ["es", "es", "es"],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
      primaryLanguageContent: { common: { hi: "Hi" } },
    });

    // Only one "es" import should appear in the resources file.
    const resources = fs.readFileSync(
      path.join(tmp.dir, "i18n/resources.ts"),
      "utf-8"
    );
    const importMatches = resources.match(/import es/g) ?? [];
    expect(importMatches).toHaveLength(1);
  });
});
