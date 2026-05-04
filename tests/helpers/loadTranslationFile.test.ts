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
import { loadTranslationFile } from "../../src/helpers/loadTranslationFile";
import { createTempDir } from "./tempDir";

const tmp = createTempDir("load-translation-file");

describe("loadTranslationFile", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let warnSpy: ReturnType<typeof spyOn>;
  let logSpy: ReturnType<typeof spyOn>;
  let errorSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    tmp.reset();
    warnSpy = spyOn(console, "warn").mockImplementation(() => {});
    logSpy = spyOn(console, "log").mockImplementation(() => {});
    errorSpy = spyOn(console, "error").mockImplementation(() => {});
  });

  it("loads and parses a .json file", async () => {
    fs.writeFileSync(
      path.join(tmp.dir, "en.json"),
      JSON.stringify({ greeting: "Hello" })
    );
    const result = await loadTranslationFile("en.json");
    expect(result).toEqual({ greeting: "Hello" });
  });

  it("returns null and logs an error for malformed JSON", async () => {
    fs.writeFileSync(path.join(tmp.dir, "broken.json"), "{not json");
    const result = await loadTranslationFile("broken.json");
    expect(result).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it("warns and returns null when the file does not exist", async () => {
    const result = await loadTranslationFile("missing.json");
    expect(result).toBeNull();
    expect(warnSpy.mock.calls.some((c) => String(c[0]).includes("File not found"))).toBe(true);
  });

  it("warns and returns null for .ts files (currently unsupported)", async () => {
    fs.writeFileSync(
      path.join(tmp.dir, "en.ts"),
      "export default { greeting: 'Hello' };"
    );
    const result = await loadTranslationFile("en.ts");
    expect(result).toBeNull();
    expect(
      warnSpy.mock.calls.some((c) =>
        String(c[0]).includes(".ts files are not yet supported")
      )
    ).toBe(true);
  });

  it("warns and returns null for unrecognized extensions", async () => {
    fs.writeFileSync(path.join(tmp.dir, "en.yaml"), "greeting: Hello");
    const result = await loadTranslationFile("en.yaml");
    expect(result).toBeNull();
    expect(
      warnSpy.mock.calls.some((c) =>
        String(c[0]).includes("Unsupported file extension")
      )
    ).toBe(true);
  });

  it("loads a .js file via dynamic import (CJS default export)", async () => {
    // Use a unique filename per test to avoid Node's ESM module cache returning
    // a stale module across runs (same trick we used in getMergedConfig).
    const filename = `en-${Date.now()}-${Math.random().toString(36).slice(2)}.js`;
    fs.writeFileSync(
      path.join(tmp.dir, filename),
      "module.exports = { greeting: 'Hello from JS' };"
    );
    const result = await loadTranslationFile(filename);
    expect(result).toEqual({ greeting: "Hello from JS" });
    expect(logSpy.mock.calls.some((c) => String(c[0]).includes("dynamic import"))).toBe(
      true
    );
  });
});
