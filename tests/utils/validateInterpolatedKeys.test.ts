import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import validateInterpolatedKeys from "../../src/lib/utils/validateInterpolatedKeys";

describe("validateInterpolatedKeys", () => {
  // Capture warnings into a local array per test rather than relying on
  // spyOn(console, "warn"). bun reuses spies across files when multiple
  // tests spy on the same builtin, so call-count assertions on a fresh spy
  // can leak prior tests' calls. A scoped console.warn replacement is
  // simpler and bulletproof.
  let warnings: string[];
  let originalWarn: typeof console.warn;

  beforeEach(() => {
    warnings = [];
    originalWarn = console.warn;
    console.warn = (...args: any[]) =>
      warnings.push(args.map((a) => String(a)).join(" "));
  });

  afterEach(() => {
    console.warn = originalWarn;
  });

  it("does not warn when provided keys exactly match required keys", () => {
    validateInterpolatedKeys("Hello, {{name}}", { name: "B" });
    expect(warnings).toHaveLength(0);
  });

  it("warns when a required key is missing", () => {
    validateInterpolatedKeys("Hello, {{name}}", {});
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Missing required keys: name");
  });

  it("warns when an unexpected key is provided", () => {
    validateInterpolatedKeys("Hello, {{name}}", {
      name: "B",
      extra: "x",
    });
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toContain("Unexpected keys: extra");
  });

  it("reports both missing and extra keys in a single warning", () => {
    validateInterpolatedKeys("Hi {{first}} {{last}}", {
      first: "B",
      bogus: "x",
    });
    expect(warnings[0]).toContain("Unexpected keys: bogus");
    expect(warnings[0]).toContain("Missing required keys: last");
  });

  it("treats an empty template + empty options as valid", () => {
    validateInterpolatedKeys("Plain text", {});
    expect(warnings).toHaveLength(0);
  });
});
