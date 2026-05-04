import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  spyOn,
} from "bun:test";
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { act } from "react";
import useLanguageChange from "../../src/lib/hooks/useLanguageChange";
import languageChangeEmitter from "../../src/lib/utils/languageChangeEmitter";

// happy-dom is registered in tests/setup.ts. The React 18+ DOM client + the
// new `act` in `react` give us a minimal harness with no testing-library.

let renders = 0;
function ProbeComponent() {
  useLanguageChange();
  renders++;
  return React.createElement("div", null, `r${renders}`);
}

describe("useLanguageChange", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    renders = 0;
    languageChangeEmitter.listeners.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("subscribes a listener on mount and unsubscribes on unmount", () => {
    const before = languageChangeEmitter.listeners.size;

    act(() => {
      root.render(React.createElement(ProbeComponent));
    });

    expect(languageChangeEmitter.listeners.size).toBe(before + 1);

    act(() => {
      root.unmount();
    });

    expect(languageChangeEmitter.listeners.size).toBe(before);
  });

  it("triggers a re-render when the emitter fires", () => {
    act(() => {
      root.render(React.createElement(ProbeComponent));
    });
    const initialRenders = renders;

    act(() => {
      languageChangeEmitter.emit();
    });

    expect(renders).toBeGreaterThan(initialRenders);
  });

  it("does not re-render after unmount, even if the emitter fires", () => {
    act(() => {
      root.render(React.createElement(ProbeComponent));
    });

    act(() => {
      root.unmount();
    });
    const rendersAfterUnmount = renders;

    act(() => {
      languageChangeEmitter.emit();
    });

    expect(renders).toBe(rendersAfterUnmount);
  });

  it("supports multiple components subscribing independently", () => {
    const before = languageChangeEmitter.listeners.size;

    const c1 = document.createElement("div");
    const c2 = document.createElement("div");
    document.body.append(c1, c2);
    const r1 = createRoot(c1);
    const r2 = createRoot(c2);

    act(() => {
      r1.render(React.createElement(ProbeComponent));
      r2.render(React.createElement(ProbeComponent));
    });
    expect(languageChangeEmitter.listeners.size).toBe(before + 2);

    act(() => {
      r1.unmount();
    });
    expect(languageChangeEmitter.listeners.size).toBe(before + 1);

    act(() => {
      r2.unmount();
    });
    expect(languageChangeEmitter.listeners.size).toBe(before);

    c1.remove();
    c2.remove();
  });
});
