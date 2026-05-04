import { describe, it, expect } from "bun:test";
import flattenContent from "../../src/helpers/flattenContent";

describe("flattenContent", () => {
  it("emits one entry per leaf key, grouped by namespace", () => {
    const result = flattenContent({
      common: { hello: "Hello", bye: "Bye" },
      auth: { login: "Login" },
    });
    expect(result).toEqual([
      { namespace: "common", key: "hello" },
      { namespace: "common", key: "bye" },
      { namespace: "auth", key: "login" },
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(flattenContent({})).toEqual([]);
  });

  it("emits zero entries for namespaces with no keys", () => {
    expect(flattenContent({ common: {} })).toEqual([]);
  });

  it("skips namespaces whose value is null or non-object (defensive)", () => {
    // The backend can theoretically return malformed data; the function
    // should not throw and should simply emit nothing for those namespaces.
    const result = flattenContent({
      good: { hi: "Hi" },
      bad: null as any,
      alsoBad: "string-value" as any,
    });
    expect(result).toEqual([{ namespace: "good", key: "hi" }]);
  });
});
