// Stub for `globalThis.fetch` that delegates to a per-test handler. The
// handler receives the parsed `URL` and the request init (headers/body), and
// returns either a mock `Response` or a description object that gets converted
// to one. Bodies are JSON-serialized.
//
// Usage:
//   const fetchMock = mockFetch(({ url, body }) => {
//     if (url.pathname === "/translate") return { status: 202, body: {} };
//     return { status: 404, body: { error: "not found" } };
//   });
//   ...assertions on fetchMock.calls...
//   fetchMock.restore();

export type FetchCall = {
  url: URL;
  method: string;
  body: any;
  headers: Record<string, string>;
};

export type FetchHandlerResult = {
  status?: number;
  body?: any;
  ok?: boolean;
  statusText?: string;
};

export type FetchHandler = (
  call: FetchCall
) => FetchHandlerResult | Promise<FetchHandlerResult>;

type FetchMock = {
  calls: FetchCall[];
  restore: () => void;
};

const buildResponse = (result: FetchHandlerResult): Response => {
  const status = result.status ?? 200;
  const ok = result.ok ?? (status >= 200 && status < 300);
  const bodyText = result.body === undefined ? "" : JSON.stringify(result.body);
  // Construct a Response-shaped object. We don't use the global Response
  // constructor because some test environments (jsdom/happy-dom variants)
  // implement it differently — a plain object with the read APIs we need is
  // enough for the production code under test.
  return {
    ok,
    status,
    statusText: result.statusText ?? (ok ? "OK" : "Error"),
    json: async () => (result.body === undefined ? null : result.body),
    text: async () => bodyText,
  } as unknown as Response;
};

export const mockFetch = (handler: FetchHandler): FetchMock => {
  const original = globalThis.fetch;
  const state: FetchMock = {
    calls: [],
    restore: () => {
      globalThis.fetch = original;
    },
  };

  globalThis.fetch = (async (
    input: string | URL | Request,
    init?: RequestInit
  ) => {
    const url =
      input instanceof URL
        ? input
        : new URL(typeof input === "string" ? input : input.url);
    const method = (init?.method ?? "GET").toUpperCase();
    const headers: Record<string, string> = {};
    if (init?.headers) {
      const h = init.headers as Record<string, string>;
      for (const k of Object.keys(h)) headers[k] = h[k];
    }
    let body: any = undefined;
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body);
      } catch {
        body = init.body;
      }
    }
    const call: FetchCall = { url, method, body, headers };
    state.calls.push(call);
    const result = await handler(call);
    return buildResponse(result);
  }) as typeof globalThis.fetch;

  return state;
};
