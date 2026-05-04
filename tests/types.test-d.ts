// Type-only tests: this file is checked by `tsc --noEmit` via tsconfig.test.json.
// Each `// @ts-expect-error` comment fails the typecheck if the line below it
// becomes valid. Each plain assignment fails if the line becomes invalid.
// No runtime — every binding is a type-level assertion.

import TranslateSheet from "../src/lib/TranslateSheet";

const t = TranslateSheet.create("ns", {
  staticText: "I am static",
  greeting: "Hello, {{name}}",
  multi: "Hi {{first}}, you have {{count}} messages",
  withFormat: "Hi {{ name, uppercase }}",
  nested: {
    label: "Click me",
    interp: "Welcome {{user}}",
  },
});

// --- positive cases (must compile) ---

const _staticUsage: string = t.staticText;
const _greetingResult: string = t.greeting({ name: "B" });
const _multiResult: string = t.multi({ first: "B", count: 2 });
const _multiCoerce: string = t.multi({ first: "B", count: "2" });
const _formatResult: string = t.withFormat({ name: "B" });
const _withExtras: string = t.greeting({ name: "B" }, { lng: "es" });
const _nestedStatic: string = t.nested.label;
const _nestedInterp: string = t.nested.interp({ user: "B" });

// --- negative cases (must fail to compile) ---

// @ts-expect-error wrong key — should be `name`, not `blah`
t.greeting({ blah: "B" });

// @ts-expect-error missing required key
t.greeting({});

// @ts-expect-error missing required key (multi)
t.multi({ first: "B" });

// @ts-expect-error static strings are not callable
t.staticText({ anything: "x" });

// @ts-expect-error nested interpolated leaf still enforces its key
t.nested.interp({ wrong: "B" });

// @ts-expect-error options arg is required when the template has placeholders
t.greeting();

// @ts-expect-error format spec is stripped — the key is `name`, not `name, uppercase`
t.withFormat({ "name, uppercase": "B" });

// --- "forgot to call the function" cases ---
// An interpolated leaf is typed as a function, not as `string`, so using it in
// any context that wants a string fails to compile.

// @ts-expect-error assigning the uncalled callable to a string fails
const _forgotToCall: string = t.greeting;

const _consume: (s: string) => void = (_s) => {};
// @ts-expect-error passing the uncalled callable to a function expecting a string fails
_consume(t.greeting);

const _propConsumer = (_props: { label: string }) => null;
// @ts-expect-error string-typed props reject the uncalled callable (the JSX-children case behaves the same)
_propConsumer({ label: t.greeting });
