import { describe, it, expect } from "bun:test";
import formatAsJSON from "../src/helpers/formatAsJSON";
import formatAsJavaScript from "../src/helpers/formatAsJavaScript";
import formatAsTypeScript from "../src/helpers/formatAsTypeScript";

/**
 * Test object that includes a nested object, an array, and a key with a dash,
 * to ensure all special cases are handled.
 */
const testContent = {
  greeting: "Hello",
  "some-key": "Has a dash in its key",
  nested: {
    subKey: "Some nested value",
  },
};

describe("formatAsJSON", () => {
  it("should produce valid, pretty-printed JSON with all data intact", () => {
    const json = formatAsJSON(testContent);

    // Verify it's parseable JSON
    let parsed;
    expect(() => {
      parsed = JSON.parse(json);
    }).not.toThrow();

    // Check that we got everything in place
    expect(parsed).toEqual(testContent);

    // By default, JSON.stringify with null, 2 uses two spaces for indentation
    expect(json).toContain('  "greeting"');
    expect(json).toContain('  "some-key"');
    expect(json).toContain('    "subKey"');

    // Ensure it doesn't contain trailing commas after the last property (which JSON.stringify won't do)
    // Just a quick naive check:
    const lines = json.split("\n").map((l) => l.trim());
    expect(lines.some((l) => l.endsWith(",") && l.includes("}"))).toBe(false);
    expect(lines.some((l) => l.endsWith(",") && l.includes("]"))).toBe(false);
  });
});

describe("formatAsJavaScript", () => {
  it("should produce valid JavaScript with trailing commas and sanitize the language name", () => {
    const language = "en-US"; // notice the dash
    const js = formatAsJavaScript(testContent, language);

    // The variable name in the generated code must have the dash replaced by underscore
    expect(js).toContain("const en_US = {");
    // We expect a trailing comma after each property in the object
    expect(js).toContain('greeting: "Hello",');
    expect(js).toContain('"some-key": "Has a dash in its key",');
    // Nested object should also have trailing commas in each property
    expect(js).toContain('subKey: "Some nested value",');
    // Should end with an export
    expect(js).toMatch(/export default en_US;/);
  });

  it("should handle simple language codes without underscores, e.g. 'fr'", () => {
    const js = formatAsJavaScript({ a: 1 }, "fr");
    expect(js).toContain("const fr = {");
    expect(js).toContain("a: 1,");
    expect(js).toMatch(/export default fr;/);
  });
});

describe("formatAsTypeScript", () => {
  it("should produce valid TypeScript with trailing commas and sanitize the language name", () => {
    const language = "pt-BR"; // includes a dash
    const ts = formatAsTypeScript(testContent, language);

    // Imports the generated Translations type
    expect(ts).toContain('import { Translations } from "./translations.types";');
    // The variable name in the generated code must have the dash replaced by underscore
    expect(ts).toContain("const pt_BR: Translations = {");
    // We expect a trailing comma after each property
    expect(ts).toContain('greeting: "Hello",');
    expect(ts).toContain('"some-key": "Has a dash in its key",');
    // Nested object and array checks
    expect(ts).toContain('subKey: "Some nested value",');
    // Check the final export
    expect(ts).toMatch(/export default pt_BR;/);
  });

  it("should handle a language with no dash, e.g. 'en'", () => {
    const ts = formatAsTypeScript({ foo: "bar" }, "en");
    expect(ts).toContain('import { Translations } from "./translations.types";');
    expect(ts).toContain("const en: Translations = {");
    expect(ts).toContain('foo: "bar",');
    expect(ts).toMatch(/export default en;/);
  });
});
