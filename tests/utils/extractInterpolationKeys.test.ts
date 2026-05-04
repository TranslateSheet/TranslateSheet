import { describe, it, expect } from "bun:test";
import extractInterpolationKeys from "../../src/lib/utils/extractInterpolationKeys";

describe("extractInterpolationKeys", () => {
  it("returns an empty array for a string with no placeholders", () => {
    expect(extractInterpolationKeys("Plain text")).toEqual([]);
  });

  it("extracts a single placeholder", () => {
    expect(extractInterpolationKeys("Hello, {{name}}")).toEqual(["name"]);
  });

  it("extracts multiple placeholders in order", () => {
    expect(
      extractInterpolationKeys("Hi {{first}}, you have {{count}} messages")
    ).toEqual(["first", "count"]);
  });

  it("trims whitespace around placeholder names", () => {
    expect(extractInterpolationKeys("Hi {{  name  }}")).toEqual(["name"]);
  });

  it("does not strip the format spec — that is the caller's job", () => {
    // The runtime regex is intentionally permissive; key-name normalization
    // happens elsewhere (validateInterpolatedKeys) so we don't hide format
    // mistakes.
    expect(extractInterpolationKeys("{{name, uppercase}}")).toEqual([
      "name, uppercase",
    ]);
  });

  it("returns an empty array for an empty string", () => {
    expect(extractInterpolationKeys("")).toEqual([]);
  });
});
