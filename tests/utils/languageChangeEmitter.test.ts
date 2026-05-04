import { describe, it, expect, beforeEach } from "bun:test";
import languageChangeEmitter from "../../src/lib/utils/languageChangeEmitter";

describe("languageChangeEmitter", () => {
  // The emitter is a module-level singleton; clear listeners between tests so
  // assertions about listener counts aren't polluted by other tests in this
  // file or by the TranslateSheet runtime tests run elsewhere.
  beforeEach(() => {
    languageChangeEmitter.listeners.clear();
  });

  it("calls every subscribed listener on emit", () => {
    let callsA = 0;
    let callsB = 0;
    languageChangeEmitter.subscribe(() => callsA++);
    languageChangeEmitter.subscribe(() => callsB++);

    languageChangeEmitter.emit();

    expect(callsA).toBe(1);
    expect(callsB).toBe(1);
  });

  it("returns an unsubscribe function that removes the listener", () => {
    let calls = 0;
    const unsubscribe = languageChangeEmitter.subscribe(() => calls++);

    languageChangeEmitter.emit();
    expect(calls).toBe(1);

    unsubscribe();
    languageChangeEmitter.emit();
    expect(calls).toBe(1);
  });

  it("treats unsubscribing twice as a no-op", () => {
    const unsubscribe = languageChangeEmitter.subscribe(() => {});
    expect(() => {
      unsubscribe();
      unsubscribe();
    }).not.toThrow();
    expect(languageChangeEmitter.listeners.size).toBe(0);
  });

  it("treats emit with no subscribers as a no-op", () => {
    expect(() => languageChangeEmitter.emit()).not.toThrow();
  });
});
