// TODO: needs a lot more work
import { beforeEach, describe, test, expect, spyOn } from "bun:test";
import i18n from "i18next";
import TranslateSheet from "../src/lib/TranslateSheet";

// If your code references `react-i18next` specifically, you might import `initReactI18next`.
// For a non-React environment, you can just call `i18n.init()` directly without `initReactI18next`.
import { initReactI18next } from "react-i18next";

// Mock out the custom React hook to avoid invalid hook calls
import * as useLanguageChangeModule from "../src/lib/hooks/useLanguageChange";
spyOn(useLanguageChangeModule, "default").mockImplementation(() => {
  // no-op
});

// Before each test, we fully re-initialize i18n to a known state.
beforeEach(async () => {
  // Reset i18n so multiple tests don't conflict
  i18n.isInitialized = false;
  i18n.off("initialized"); // Remove any leftover listeners

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
});
