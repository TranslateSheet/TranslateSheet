import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import { pullTranslationContent } from "../../src/api/pullTranslationContent";
import { mockFetch, type FetchHandler } from "../helpers/fetchMock";

const setup = (handler: FetchHandler) => {
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "error").mockImplementation(() => {});
  return mockFetch(handler);
};

describe("pullTranslationContent", () => {
  let fetch: ReturnType<typeof mockFetch>;

  afterEach(() => fetch?.restore());

  it("POSTs to /translations/pull-translations and returns data", async () => {
    fetch = setup(() => ({
      status: 200,
      body: {
        success: true,
        data: {
          en: { common: { hi: "Hi" } },
          es: { common: { hi: "Hola" } },
        },
      },
    }));

    const result = await pullTranslationContent({ apiKey: "ak" });
    expect(result).toEqual({
      en: { common: { hi: "Hi" } },
      es: { common: { hi: "Hola" } },
    });
    expect(fetch.calls[0].url.pathname).toBe("/translations/pull-translations");
    expect(fetch.calls[0].method).toBe("POST");
    expect(fetch.calls[0].body).toEqual({ apiKey: "ak" });
  });

  it("logs a success message when not silent", async () => {
    const logs: string[] = [];
    const original = console.log;
    console.log = (...args: any[]) => logs.push(args.map(String).join(" "));
    fetch = mockFetch(() => ({
      status: 200,
      body: { success: true, data: {} },
    }));

    try {
      await pullTranslationContent({ apiKey: "ak" });
    } finally {
      console.log = original;
    }

    expect(logs.some((m) => m.includes("Successfully pulled translations"))).toBe(
      true
    );
  });

  it("does not log when silent: true", async () => {
    const logs: string[] = [];
    const original = console.log;
    console.log = (...args: any[]) => logs.push(args.map(String).join(" "));
    fetch = mockFetch(() => ({
      status: 200,
      body: { success: true, data: {} },
    }));

    try {
      await pullTranslationContent({ apiKey: "ak", silent: true });
    } finally {
      console.log = original;
    }

    expect(logs.some((m) => m.includes("Successfully pulled translations"))).toBe(
      false
    );
  });

  it("throws when the backend reports success: false", async () => {
    fetch = setup(() => ({
      status: 200,
      body: { success: false, data: null },
    }));

    await expect(pullTranslationContent({ apiKey: "ak" })).rejects.toThrow(
      /not successful/
    );
  });

  it("throws on non-OK status codes", async () => {
    fetch = setup(() => ({
      status: 500,
      statusText: "Internal Server Error",
      body: { error: "boom" },
    }));

    await expect(pullTranslationContent({ apiKey: "ak" })).rejects.toThrow(
      /Backend pull failed/
    );
  });
});
