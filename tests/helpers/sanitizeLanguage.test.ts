import { describe, it, expect } from "bun:test";
import sanitizeLanguage from "../../src/helpers/sanitizeLanguage";

describe("sanitizeLanguage", () => {
  it("replaces a single hyphen with an underscore", () => {
    expect(sanitizeLanguage("pt-BR")).toBe("pt_BR");
  });

  it("replaces every hyphen, not just the first", () => {
    expect(sanitizeLanguage("zh-Hant-HK")).toBe("zh_Hant_HK");
  });

  it("returns the input unchanged when there are no hyphens", () => {
    expect(sanitizeLanguage("en")).toBe("en");
    expect(sanitizeLanguage("")).toBe("");
  });

  it("preserves non-ASCII characters", () => {
    expect(sanitizeLanguage("naïve-fr")).toBe("naïve_fr");
  });
});
