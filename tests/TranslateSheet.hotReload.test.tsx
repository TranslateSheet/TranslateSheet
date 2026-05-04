// Hot-reload contract tests.
//
// We can't run a real Metro / Webpack / Vite Fast Refresh in a unit test, but
// we *can* simulate the effect: when a developer edits a translation source
// file in their app, the bundler re-evaluates that module, which in practice
// means `TranslateSheet.create("ns", { ... })` is called again with a new
// translations object. Every invariant below is something the runtime must
// hold for that re-evaluation flow to feel instant in the simulator.

import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  expect,
  spyOn,
  test,
} from "bun:test";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import TranslateSheet from "../src/lib/TranslateSheet";

// Mock the hook only for this file's lifetime; restore on afterAll so the
// no-op doesn't leak into the real hook test in tests/hooks/.
import * as useLanguageChangeModule from "../src/lib/hooks/useLanguageChange";
let hookSpy: ReturnType<typeof spyOn> | undefined;
beforeAll(() => {
  hookSpy = spyOn(useLanguageChangeModule, "default").mockImplementation(
    () => {}
  );
});
afterAll(() => {
  hookSpy?.mockRestore();
});

beforeEach(async () => {
  i18n.isInitialized = false;
  await i18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: {}, es: {} },
    interpolation: { escapeValue: false },
  });
  await i18n.changeLanguage("en");
});

describe("hot-reload contract", () => {
  test("re-creating a namespace returns the latest source value (primary lang)", () => {
    const before = TranslateSheet.create("HmrFreshness", {
      hi: "Hello",
    });
    expect(`${before.hi}`).toBe("Hello");

    // Simulate Fast Refresh: same module, edited string.
    const after = TranslateSheet.create("HmrFreshness", {
      hi: "Hello World",
    });
    expect(`${after.hi}`).toBe("Hello World");
  });

  test("a key added during a session is immediately visible (primary lang)", () => {
    TranslateSheet.create("HmrAddKey", {});

    // Developer adds a new key, saves, Fast Refresh re-runs the module.
    const updated = TranslateSheet.create("HmrAddKey", {
      newKey: "Howdy",
    });
    expect(`${updated.newKey}`).toBe("Howdy");
  });

  test("interpolated leaves pick up edits to the placeholder template", () => {
    TranslateSheet.create("HmrInterp", {
      greeting: "Hello, {{name}}",
    });

    const after = TranslateSheet.create("HmrInterp", {
      greeting: "Hi there, {{name}}!",
    });
    expect(after.greeting({ name: "B" })).toBe("Hi there, B!");
  });

  test("does not accumulate i18n languageChanged listeners across re-creates", () => {
    // The original bug this whole effort started from. Re-stated here as part
    // of the HMR contract: a save-edit loop can re-evaluate a module dozens of
    // times in a session, and listener count must stay flat.
    const observers = (i18n as any).observers?.languageChanged as
      | Map<unknown, number>
      | undefined;
    const before = observers?.size ?? 0;

    for (let i = 0; i < 50; i++) {
      TranslateSheet.create("HmrListenerLeak", { hi: `Hello ${i}` });
    }

    const after =
      ((i18n as any).observers?.languageChanged as Map<unknown, number> | undefined)
        ?.size ?? 0;
    expect(after).toBe(before);
  });

  test("non-primary cached values are invalidated when the language changes, not by re-creation", async () => {
    // Documents the existing semantic: in non-primary lang the displayed
    // value comes from i18next, not from the source literal. So editing the
    // source while testing in `es` does not (and should not) change what's
    // displayed — the developer regenerates translations via the CLI for
    // that. The library's job is only to clear the cache on language change.
    await i18n.changeLanguage("es");

    let tCalls = 0;
    const tSpy = spyOn(i18n, "t").mockImplementation(((key: string) => {
      tCalls++;
      return `i18n:${key}`;
    }) as any);

    const t1 = TranslateSheet.create("HmrCache", { hi: "Hello" });
    void `${t1.hi}`;
    expect(tCalls).toBe(1);
    void `${t1.hi}`;
    expect(tCalls).toBe(1); // memoized

    // HMR equivalent — re-create with a new source value. The cache lives in
    // the library's module scope (not the user's), so the lookup is still
    // memoized. This is the documented current behavior.
    const t2 = TranslateSheet.create("HmrCache", { hi: "Hello edited" });
    void `${t2.hi}`;
    expect(tCalls).toBe(1);

    // Language change clears the cache; next access re-queries i18n.
    await i18n.changeLanguage("es");
    void `${t2.hi}`;
    expect(tCalls).toBe(2);

    tSpy.mockRestore();
  });
});
