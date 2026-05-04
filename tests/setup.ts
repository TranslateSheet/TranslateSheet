// Global preload for `bun test`. Configured via bunfig.toml.
//
// happy-dom is registered conditionally — only tests that import React need
// `window`/`document`, but registering globally is cheap (one-time cost on
// first test in the process) and lets any test opt into DOM APIs without
// per-file boilerplate.
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (typeof globalThis.window === "undefined") {
  GlobalRegistrator.register();
}

// Tell React this is an act-aware environment so React 18 doesn't warn
// "current testing environment is not configured to support act(...)" on every
// hook test. See https://github.com/reactwg/react-18/discussions/102.
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
