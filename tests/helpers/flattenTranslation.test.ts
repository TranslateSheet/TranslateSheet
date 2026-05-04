import { describe, it, expect } from "bun:test";
import { flattenTranslations } from "../../src/helpers/flattenTranslation";

describe("flattenTranslations", () => {
  it("flattens a nested object using dot notation", () => {
    expect(
      flattenTranslations({
        step1: { title: "Step 1", editText: "Edit" },
        step2: { title: "Step 2" },
      })
    ).toEqual({
      "step1.title": "Step 1",
      "step1.editText": "Edit",
      "step2.title": "Step 2",
    });
  });

  it("preserves arrays as leaves rather than walking into them", () => {
    const arr = ["a", "b", "c"];
    expect(flattenTranslations({ items: arr })).toEqual({ items: arr });
  });

  it("preserves null and primitive leaves", () => {
    expect(
      flattenTranslations({
        nullable: null,
        count: 5,
        flag: true,
        text: "hi",
      })
    ).toEqual({ nullable: null, count: 5, flag: true, text: "hi" });
  });

  it("returns the input unchanged for non-object inputs", () => {
    expect(flattenTranslations("hello" as any)).toBe("hello");
    expect(flattenTranslations(null as any)).toBe(null);
    expect(flattenTranslations([1, 2, 3] as any)).toEqual([1, 2, 3]);
  });

  it("flattens deeply nested objects", () => {
    expect(
      flattenTranslations({
        a: { b: { c: { d: "deep" } } },
      })
    ).toEqual({ "a.b.c.d": "deep" });
  });
});
