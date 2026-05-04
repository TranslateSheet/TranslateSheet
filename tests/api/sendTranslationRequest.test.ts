import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import sendTranslationRequest from "../../src/api/sendTranslationRequest";
import { mockFetch, type FetchHandler } from "../helpers/fetchMock";

const setup = (handler: FetchHandler) => {
  spyOn(console, "log").mockImplementation(() => {});
  spyOn(console, "error").mockImplementation(() => {});
  return mockFetch(handler);
};

describe("sendTranslationRequest", () => {
  let fetch: ReturnType<typeof mockFetch>;

  afterEach(() => fetch?.restore());

  it("POSTs to /translations/translate with content + targetLanguage + apiKey", async () => {
    fetch = setup(() => ({ status: 202, body: {} }));

    await sendTranslationRequest({
      content: { common: { hi: "Hi" } },
      targetLanguage: "es",
      apiKey: "ak",
    });

    expect(fetch.calls).toHaveLength(1);
    const call = fetch.calls[0];
    expect(call.method).toBe("POST");
    expect(call.url.href).toBe(
      "https://api.translatesheet.co/translations/translate"
    );
    expect(call.body).toEqual({
      content: { common: { hi: "Hi" } },
      targetLanguage: "es",
      apiKey: "ak",
      openAiKey: undefined,
      anthropicKey: undefined,
    });
    expect(call.headers["Content-Type"]).toBe("application/json");
  });

  it("forwards openAiKey and anthropicKey when provided", async () => {
    fetch = setup(() => ({ status: 202, body: {} }));

    await sendTranslationRequest({
      content: {},
      targetLanguage: "fr",
      apiKey: "ak",
      openAiKey: "sk-oai",
      anthropicKey: "sk-ant",
    });

    expect(fetch.calls[0].body.openAiKey).toBe("sk-oai");
    expect(fetch.calls[0].body.anthropicKey).toBe("sk-ant");
  });

  it("throws a 401-specific message on 401", async () => {
    fetch = setup(() => ({ status: 401, body: {} }));

    await expect(
      sendTranslationRequest({ content: {}, targetLanguage: "es", apiKey: "ak" })
    ).rejects.toThrow(/Unauthorized/);
  });

  it("throws with the backend's error message on 403", async () => {
    fetch = setup(() => ({
      status: 403,
      body: { error: "quota exceeded" },
    }));

    await expect(
      sendTranslationRequest({ content: {}, targetLanguage: "es", apiKey: "ak" })
    ).rejects.toThrow(/quota exceeded/);
  });

  it("throws with the backend's error message on 400", async () => {
    fetch = setup(() => ({
      status: 400,
      body: { error: "missing content" },
    }));

    await expect(
      sendTranslationRequest({ content: {}, targetLanguage: "es", apiKey: "ak" })
    ).rejects.toThrow(/missing content/);
  });

  it("throws a generic error message for unexpected non-OK statuses", async () => {
    fetch = setup(() => ({ status: 502, statusText: "Bad Gateway", body: {} }));

    await expect(
      sendTranslationRequest({ content: {}, targetLanguage: "es", apiKey: "ak" })
    ).rejects.toThrow(/502/);
  });
});
