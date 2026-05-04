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
import loadConfig, { findConfigFile } from "../../src/cli/loadConfig";
import { createTempDir } from "../helpers/tempDir";
import { mockProcessExit } from "../helpers/processExitMock";

const tmp = createTempDir("load-config");

// Use a unique filename per test to dodge Node's ESM module cache, which
// would otherwise return a stale module when two tests reuse the same path.
const uniqueName = (ext: string) =>
  `cfg-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

describe("loadConfig", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  beforeEach(() => {
    tmp.reset();
    spyOn(console, "warn").mockImplementation(() => {});
    spyOn(console, "error").mockImplementation(() => {});
  });

  it("returns {} when the file does not exist", async () => {
    const result = await loadConfig("./does-not-exist.js");
    expect(result).toEqual({});
  });

  it("loads a .cjs config via require", async () => {
    const name = uniqueName(".cjs");
    fs.writeFileSync(
      path.join(tmp.dir, name),
      "module.exports = { primaryLanguage: 'fr', languages: ['en'] };"
    );
    const result = await loadConfig(name);
    expect(result.primaryLanguage).toBe("fr");
    expect(result.languages).toEqual(["en"]);
  });

  it("loads a .js config via dynamic import", async () => {
    const name = uniqueName(".js");
    fs.writeFileSync(
      path.join(tmp.dir, name),
      "module.exports = { apiKey: 'from-js', languages: ['de'] };"
    );
    const result = await loadConfig(name);
    expect(result.apiKey).toBe("from-js");
    expect(result.languages).toEqual(["de"]);
  });

  it("loads a .ts config via jiti", async () => {
    const name = uniqueName(".ts");
    fs.writeFileSync(
      path.join(tmp.dir, name),
      `export default { apiKey: 'from-ts', languages: ['it'] as const };`
    );
    const result = await loadConfig(name);
    expect(result.apiKey).toBe("from-ts");
    expect(result.languages).toEqual(["it"]);
  });

  it("calls process.exit(1) when the config file throws while loading", async () => {
    const exit = mockProcessExit();
    const name = uniqueName(".cjs");
    fs.writeFileSync(
      path.join(tmp.dir, name),
      "throw new Error('boom in config');"
    );

    await expect(loadConfig(name)).rejects.toThrow(/process\.exit/);
    expect(exit.code).toBe(1);
    exit.restore();
  });
});

describe("findConfigFile", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let warnSpy: ReturnType<typeof spyOn>;

  beforeEach(() => {
    tmp.reset();
    warnSpy = spyOn(console, "warn").mockImplementation(() => {});
  });

  it("returns undefined when no config file exists", () => {
    expect(findConfigFile()).toBeUndefined();
  });

  it("finds a translateSheetConfig.js file", () => {
    fs.writeFileSync(
      path.join(tmp.dir, "translateSheetConfig.js"),
      "module.exports = {};"
    );
    expect(findConfigFile()).toBe("translateSheetConfig.js");
  });

  it("warns when multiple config files match and returns the first", () => {
    fs.writeFileSync(
      path.join(tmp.dir, "translateSheetConfig.js"),
      "module.exports = {};"
    );
    fs.mkdirSync(path.join(tmp.dir, "subdir"), { recursive: true });
    fs.writeFileSync(
      path.join(tmp.dir, "subdir/translateSheetConfig.ts"),
      "export default {};"
    );
    const result = findConfigFile();
    expect(result).toBeDefined();
    expect(
      warnSpy.mock.calls.some((c) =>
        String(c[0]).includes("Multiple translateSheetConfig files")
      )
    ).toBe(true);
  });

  it("ignores configs inside node_modules / dist / build", () => {
    fs.mkdirSync(path.join(tmp.dir, "node_modules/some-pkg"), {
      recursive: true,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "node_modules/some-pkg/translateSheetConfig.js"),
      "module.exports = {};"
    );
    expect(findConfigFile()).toBeUndefined();
  });
});
