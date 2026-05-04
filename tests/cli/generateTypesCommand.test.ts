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
import { createGenerateTypesCommand } from "../../src/cli/generateTypesCommand";
import { mockProcessExit } from "../helpers/processExitMock";
import { createTempDir } from "../helpers/tempDir";

const tmp = createTempDir("generate-types-cmd");

const writeConfig = (configBody: Record<string, unknown>) => {
  const name = `cfg-${Date.now()}-${Math.random().toString(36).slice(2)}.cjs`;
  fs.writeFileSync(
    path.join(tmp.dir, name),
    `module.exports = ${JSON.stringify(configBody)};`
  );
  return name;
};

describe("generateTypesCommand", () => {
  beforeAll(() => tmp.enter());
  afterAll(() => tmp.cleanup());

  let exit: ReturnType<typeof mockProcessExit> | undefined;

  beforeEach(() => {
    tmp.reset();
    fs.mkdirSync(path.join(tmp.dir, "i18n"), { recursive: true });
    spyOn(console, "log").mockImplementation(() => {});
    spyOn(console, "warn").mockImplementation(() => {});
    spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    exit?.restore();
    exit = undefined;
  });

  it("extracts translations and writes translations.types.ts", async () => {
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
      `TranslateSheet.create("common", { hi: "Hi", world: "World" });`
    );

    await createGenerateTypesCommand().parseAsync(["--config", cfg], {
      from: "user",
    });

    const filePath = path.join(tmp.dir, "i18n/translations.types.ts");
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, "utf-8");
    expect(content).toContain("export type Translations");
    expect(content).toContain("hi: string");
    expect(content).toContain("world: string");
  });

  it("writes a Translations type with nested members for nested translations", async () => {
    const cfg = writeConfig({
      output: "./i18n",
      primaryLanguage: "en",
      languages: [],
      fileExtension: ".ts",
      apiKey: "ak",
      generatePrimaryLanguageFile: false,
    });
    fs.writeFileSync(
      path.join(tmp.dir, "Nested.tsx"),
      `TranslateSheet.create("nested", {
        outer: { inner: "Inner value" }
      });`
    );

    await createGenerateTypesCommand().parseAsync(["--config", cfg], {
      from: "user",
    });

    const content = fs.readFileSync(
      path.join(tmp.dir, "i18n/translations.types.ts"),
      "utf-8"
    );
    expect(content).toContain("nested:");
    expect(content).toContain("outer:");
    expect(content).toContain("inner: string");
  });
});
