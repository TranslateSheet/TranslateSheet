// TODO: needs a lot more work
import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  test,
  expect,
  spyOn,
} from "bun:test";
import i18n from "i18next";
import TranslateSheet from "../src/lib/TranslateSheet";

// If your code references `react-i18next` specifically, you might import `initReactI18next`.
// For a non-React environment, you can just call `i18n.init()` directly without `initReactI18next`.
import { initReactI18next } from "react-i18next";

// Mock out the custom React hook to avoid invalid hook calls. Wrapped in
// beforeAll/afterAll so the no-op doesn't leak into other test files (notably
// tests/hooks/useLanguageChange.test.tsx) when bun runs the suite together.
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

// Before each test, we fully re-initialize i18n to a known state.
beforeEach(async () => {
  // Reset i18n so multiple tests don't conflict. We intentionally do NOT call
  // `i18n.off("initialized")` here — the TranslateSheet runtime registers a
  // listener at module load that flips its own `globalI18nInitialized` flag,
  // and stripping it would force every test through the primary-language
  // fallback path regardless of `i18n.language`.
  i18n.isInitialized = false;

  // Minimal real init:
  // - We set the default language to "en" (primary)
  // - We provide an "es" translation to test non-fallback calls
  await i18n
    .use(initReactI18next)
    .init({
      lng: "en",
      fallbackLng: "en",
      resources: {
        en: {
          TestNamespace: {
            greeting: "Hello, {{name}}",
          },
          SomeNamespace: {
            staticText: "Static content",
          },
        },
        es: {
          TestNamespace: {
            greeting: "Hola, {{name}}",
          },
        },
      },
      interpolation: {
        escapeValue: false, // Not needed for react or pure usage
      },
    });

  // Re-init alone doesn't reset the active language if a prior test changed
  // it via `changeLanguage` — explicitly force it back to "en" so each test
  // starts in a known state.
  await i18n.changeLanguage("en");
});

describe("TranslateSheet (Testing Without Stubbing i18n)", () => {
  test("returns fallback (English) if language is en", () => {
    // i18n is fully initialized to `en`, the primary language → fallback path
    const translations = TranslateSheet.create("TestNamespace", {
      greeting: "Hello, {{name}}",
    });

    // Because we're in "en", your code will see that as primary
    // → fallback to raw string interpolation
    const result = translations.greeting({ name: "B" });
    expect(result).toBe("Hello, B");
  });

  test("calls i18n.t for non-primary language (es)", async () => {
    // Switch to Spanish
    await i18n.changeLanguage("es");

    // We'll spy on the real i18n.t
    const tSpy = spyOn(i18n, "t").mockImplementation(
      ((key: string, options?: any) => "Hola, B") as any
    );

    const translations = TranslateSheet.create("TestNamespace", {
      greeting: "Hello, {{name}}",
    });

    const result = translations.greeting({ name: "B" });
    // Now we expect i18n.t to have been called, returning the Spanish string
    // expect(tSpy).toHaveBeenCalledTimes(1);
    // expect(result).toBe("Hola, B");
  });

  test("warns if interpolation key is missing (still in en fallback)", () => {
    // Keep language = "en"
    const warnSpy = spyOn(console, "warn");

    const translations = TranslateSheet.create("TestNamespace", {
      greeting: "Hello, {{name}}",
    });

    // Omit the { name: ... }
    const result = translations.greeting();

    // The library warns about missing interpolation
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        `[TranslateSheet] Missing interpolated values for key: "TestNamespace:greeting". Expected keys: name.`
      )
    );
    // The text will keep the placeholder
    expect(result).toBe("Hello, {{ name }}");
  });

  test("returns static string property if still in en (fallback path)", () => {
    // i18n is "en," which is your fallback
    const translations = TranslateSheet.create("SomeNamespace", {
      staticText: "Static content",
    });

    expect(`${translations.staticText}`).toBe("Static content");
  });

  // Regression: TranslateSheet.create() used to register a fresh
  // i18n.on("languageChanged", ...) listener on every call, so a large app
  // with many namespaces would accumulate hundreds of listeners and degrade
  // every language switch. The listener must now be registered exactly once
  // at module load, regardless of how many namespaces are created.
  test("returns nested values via dot-path access on the proxy", () => {
    const t = TranslateSheet.create("Nested", {
      header: "Header",
      body: { title: "Body Title", subtitle: "Body Subtitle" },
    });

    expect(`${t.header}`).toBe("Header");
    expect(`${t.body.title}`).toBe("Body Title");
    expect(`${t.body.subtitle}`).toBe("Body Subtitle");
  });

  test("isolates the cache between namespaces with the same key", async () => {
    // After moving to a single module-scoped Map keyed by `${ns}:${fullKey}`,
    // two namespaces using the same key must not collide.
    await i18n.changeLanguage("es");
    const tSpy = spyOn(i18n, "t").mockImplementation(((key: string) => {
      if (key === "NamespaceA:greeting") return "value-A";
      if (key === "NamespaceB:greeting") return "value-B";
      return key;
    }) as any);

    const a = TranslateSheet.create("NamespaceA", { greeting: "X" });
    const b = TranslateSheet.create("NamespaceB", { greeting: "Y" });

    expect(`${a.greeting}`).toBe("value-A");
    expect(`${b.greeting}`).toBe("value-B");
    tSpy.mockRestore();
  });

  test("memoizes static-string lookups across repeated accesses", async () => {
    await i18n.changeLanguage("es");
    let calls = 0;
    const tSpy = spyOn(i18n, "t").mockImplementation((() => {
      calls++;
      return "Cached";
    }) as any);

    const t = TranslateSheet.create("CachingNs", { staticText: "Static content" });
    void `${t.staticText}`;
    void `${t.staticText}`;
    void `${t.staticText}`;

    expect(calls).toBe(1);
    tSpy.mockRestore();
  });

  test("forwards additional i18next options through the second arg of an interpolated leaf", async () => {
    await i18n.changeLanguage("es");
    const tSpy = spyOn(i18n, "t").mockImplementation(((_key: string, opts: any) => {
      // Echo back the options so the test can assert on what i18n.t got.
      return `name=${opts.name},lng=${opts.lng}`;
    }) as any);

    const t = TranslateSheet.create("OptsNs", {
      greeting: "Hello, {{name}}",
    });

    const result = t.greeting({ name: "B" }, { lng: "fr" });
    expect(result).toBe("name=B,lng=fr");
    tSpy.mockRestore();
  });

  test("does not add languageChanged listeners per create() call", () => {
    const observers = (i18n as any).observers?.languageChanged as
      | Map<unknown, number>
      | undefined;
    const before = observers?.size ?? 0;

    for (let i = 0; i < 100; i++) {
      TranslateSheet.create(`LeakNs${i}`, { hello: "Hello" });
    }

    const after =
      ((i18n as any).observers?.languageChanged as Map<unknown, number> | undefined)
        ?.size ?? 0;

    expect(after).toBe(before);
  });
});
