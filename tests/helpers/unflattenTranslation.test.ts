import { describe, it, expect } from "bun:test";
import { unflattenTranslations } from "../../src/helpers/unflattenTranslation";
import { flattenTranslations } from "../../src/helpers/flattenTranslation";

describe("unflattenTranslations", () => {
  it("rebuilds a nested object from dot-notation keys", () => {
    expect(
      unflattenTranslations({
        "step1.title": "Step 1",
        "step1.editText": "Edit",
        "step2.title": "Step 2",
      })
    ).toEqual({
      step1: { title: "Step 1", editText: "Edit" },
      step2: { title: "Step 2" },
    });
  });

  it("round-trips with flattenTranslations", () => {
    const original = {
      a: { b: { c: "deep" }, d: "shallow" },
      e: "top-level",
    };
    expect(unflattenTranslations(flattenTranslations(original))).toEqual(
      original
    );
  });

  it("parses string values that look like JSON objects", () => {
    // The backend sometimes serializes nested objects as JSON strings; the
    // unflattener auto-parses leaves whose trimmed form is `{...}`.
    expect(
      unflattenTranslations({
        meta: '{"version":1,"flags":{"beta":true}}',
      })
    ).toEqual({ meta: { version: 1, flags: { beta: true } } });
  });

  it("leaves malformed JSON-shaped strings as-is", () => {
    expect(unflattenTranslations({ broken: "{not json}" })).toEqual({
      broken: "{not json}",
    });
  });

  it("does not attempt to JSON-parse normal strings", () => {
    expect(unflattenTranslations({ hi: "Hello, world" })).toEqual({
      hi: "Hello, world",
    });
  });

  it("handles a flat input with no dotted keys", () => {
    expect(unflattenTranslations({ greeting: "Hello" })).toEqual({
      greeting: "Hello",
    });
  });
});
