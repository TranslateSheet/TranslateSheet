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
import writePrimaryLanguageFile from "../../src/helpers/writePrimaryLanguageFile";
import { createTempDir } from "./tempDir";

const tmp = createTempDir("write-primary");

describe("writePrimaryLanguageFile", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let logSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    tmp.reset();
    fs.mkdirSync(path.join(tmp.dir, "i18n"), { recursive: true });
    logSpy = spyOn(console, "log").mockImplementation(() => {});
  });

  it("writes the primary language file at output/<lang>.<ext>", () => {
    writePrimaryLanguageFile({
      output: "./i18n",
      fileExtension: ".ts",
      primaryLanguage: "en",
      primaryLanguageContent: { common: { hello: "Hello" } },
    });
    const written = fs.readFileSync(path.join(tmp.dir, "i18n/en.ts"), "utf-8");
    expect(written).toContain("const en");
    expect(written).toContain("hello");
    expect(written).toContain("Hello");
  });

  it("emits .json when fileExtension is .json", () => {
    writePrimaryLanguageFile({
      output: "./i18n",
      fileExtension: ".json",
      primaryLanguage: "en",
      primaryLanguageContent: { common: { hello: "Hello" } },
    });
    const filePath = path.join(tmp.dir, "i18n/en.json");
    expect(fs.existsSync(filePath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    // The JSON formatter prepends a generation-warning key.
    expect(parsed._generatedByTranslateSheet).toContain("TranslateSheet");
    expect(parsed.common).toEqual({ hello: "Hello" });
  });

  it("overwrites an existing file idempotently", () => {
    const filePath = path.join(tmp.dir, "i18n/en.ts");
    fs.writeFileSync(filePath, "stale content");
    writePrimaryLanguageFile({
      output: "./i18n",
      fileExtension: ".ts",
      primaryLanguage: "en",
      primaryLanguageContent: { common: { hi: "Hi" } },
    });
    const written = fs.readFileSync(filePath, "utf-8");
    expect(written).not.toContain("stale content");
    expect(written).toContain("hi");
  });

  it("logs which file was generated", () => {
    writePrimaryLanguageFile({
      output: "./i18n",
      fileExtension: ".ts",
      primaryLanguage: "en",
      primaryLanguageContent: { common: { hi: "Hi" } },
    });
    expect(
      logSpy.mock.calls.some((c) =>
        String(c[0]).includes("Generated primary language file")
      )
    ).toBe(true);
  });
});
