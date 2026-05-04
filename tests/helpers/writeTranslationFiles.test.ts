import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  spyOn,
} from "bun:test";
import fs from "fs";
import path from "path";
import { writeTranslationFiles } from "../../src/helpers/writeTranslationFiles";
import { createTempDir } from "./tempDir";

const tmp = createTempDir("write-translation-files");

describe("writeTranslationFiles", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  beforeEach(() => {
    tmp.reset();
    fs.mkdirSync(path.join(tmp.dir, "i18n"), { recursive: true });
    spyOn(console, "log").mockImplementation(() => {});
  });

  it("writes one file per non-primary language by default", () => {
    writeTranslationFiles({
      translationsByLang: {
        en: { common: { hi: "Hi" } },
        es: { common: { hi: "Hola" } },
        fr: { common: { hi: "Salut" } },
      },
      output: "./i18n",
      fileExtension: ".ts",
      shouldWritePrimaryLanguageFile: false,
      primaryLanguage: "en",
    });

    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.ts"))).toBe(false);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/es.ts"))).toBe(true);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/fr.ts"))).toBe(true);
  });

  it("includes the primary language when shouldWritePrimaryLanguageFile is true", () => {
    writeTranslationFiles({
      translationsByLang: {
        en: { common: { hi: "Hi" } },
        es: { common: { hi: "Hola" } },
      },
      output: "./i18n",
      fileExtension: ".ts",
      shouldWritePrimaryLanguageFile: true,
      primaryLanguage: "en",
    });
    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.ts"))).toBe(true);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/es.ts"))).toBe(true);
  });

  it('also accepts the string "true" as a truthy flag', () => {
    writeTranslationFiles({
      translationsByLang: { en: { common: { hi: "Hi" } } },
      output: "./i18n",
      fileExtension: ".ts",
      shouldWritePrimaryLanguageFile: "true",
      primaryLanguage: "en",
    });
    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.ts"))).toBe(true);
  });

  it("respects the file extension on every emitted file", () => {
    writeTranslationFiles({
      translationsByLang: {
        en: { common: { hi: "Hi" } },
        es: { common: { hi: "Hola" } },
      },
      output: "./i18n",
      fileExtension: ".json",
      shouldWritePrimaryLanguageFile: true,
      primaryLanguage: "en",
    });
    expect(fs.existsSync(path.join(tmp.dir, "i18n/en.json"))).toBe(true);
    expect(fs.existsSync(path.join(tmp.dir, "i18n/es.json"))).toBe(true);
    const enJson = JSON.parse(
      fs.readFileSync(path.join(tmp.dir, "i18n/en.json"), "utf-8")
    );
    expect(enJson.common).toEqual({ hi: "Hi" });
  });
});
