import { describe, it, expect, afterEach, spyOn } from "bun:test";
import { uploadTranslationContent } from "../../src/api/uploadTranslationContent";
import { mockFetch, type FetchHandler } from "../helpers/fetchMock";

const setup = (handler: FetchHandler) => {
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "error").mockImplementation(() => {});
  return mockFetch(handler);
};

describe("uploadTranslationContent", () => {
  let fetch: ReturnType<typeof mockFetch>;

  afterEach(() => fetch?.restore());

  it("POSTs to /translations/upload with the full payload", async () => {
    fetch = setup(() => ({ status: 200, body: {} }));

    await uploadTranslationContent({
      apiKey: "ak",
      targetLanguage: "en",
      content: { common: { hi: "Hi" } },
      isPrimary: true,
    });

    expect(fetch.calls[0].url.pathname).toBe("/translations/upload");
    expect(fetch.calls[0].body).toEqual({
      apiKey: "ak",
      targetLanguage: "en",
      content: { common: { hi: "Hi" } },
      isPrimary: true,
    });
  });

  it("returns deletedKeyCount and invalidatedKeyCount when present", async () => {
    fetch = setup(() => ({
      status: 200,
      body: { deletedKeyCount: 3, invalidatedKeyCount: 5 },
    }));

    const result = await uploadTranslationContent({
      apiKey: "ak",
      targetLanguage: "en",
      content: {},
      isPrimary: true,
    });

    expect(result).toEqual({ deletedKeyCount: 3, invalidatedKeyCount: 5 });
  });

  it("defaults missing counts to 0", async () => {
    fetch = setup(() => ({ status: 200, body: {} }));

    const result = await uploadTranslationContent({
      apiKey: "ak",
      targetLanguage: "en",
      content: {},
      isPrimary: true,
    });

    expect(result).toEqual({ deletedKeyCount: 0, invalidatedKeyCount: 0 });
  });

  it("throws on a non-OK response", async () => {
    fetch = setup(() => ({
      status: 500,
      statusText: "Internal Server Error",
      body: { error: "boom" },
    }));

    await expect(
      uploadTranslationContent({
        apiKey: "ak",
        targetLanguage: "en",
        content: {},
        isPrimary: true,
      })
    ).rejects.toThrow(/Backend upload failed/);
  });

  it("logs deletion/invalidation summaries when counts are positive", async () => {
    const logSpy = spyOn(console, "log").mockImplementation(() => {});
    fetch = mockFetch(() => ({
      status: 200,
      body: { deletedKeyCount: 2, invalidatedKeyCount: 1 },
    }));

    await uploadTranslationContent({
      apiKey: "ak",
      targetLanguage: "en",
      content: {},
      isPrimary: true,
    });

    expect(
      logSpy.mock.calls.some((c) => String(c[0]).includes("Removed 2"))
    ).toBe(true);
    expect(
      logSpy.mock.calls.some((c) => String(c[0]).includes("1 key(s) had"))
    ).toBe(true);
  });
});
