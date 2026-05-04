# HMR Smoke Test

Manual verification that TranslateSheet's hot-reload story actually works in a
real Metro / Fast Refresh environment. Run this once after any non-trivial
change to `src/lib/TranslateSheet.ts` or the runtime cache, and any time the
`react`/`react-native`/`expo` peer dep is bumped.

## Setup

```bash
cd expo-example
bun install
bun run ios     # or `bun run android`
```

Wait for the simulator to boot and the example app to load.

## Test 1 — edit an existing translation string

1. With the simulator running and the app on its home screen, open
   `expo-example/app/(tabs)/index.tsx` (or whichever screen file calls
   `TranslateSheet.create(...)`).
2. Locate any string value inside a `TranslateSheet.create(...)` block. Edit it
   to something visibly different (e.g. add `!!!` to the end).
3. Save.
4. **Expected:** within ~1s the simulator shows the new string. No manual
   reload, no app restart, navigation/scroll position preserved.

## Test 2 — add a new key

1. Inside an existing `TranslateSheet.create(...)` block, add a new key:
   ```ts
   TranslateSheet.create("home", {
     // ...existing keys
     hmrCanary: "I appeared via HMR",
   });
   ```
2. Reference it from JSX in the same file:
   ```tsx
   <Text>{translations.hmrCanary}</Text>
   ```
3. Save.
4. **Expected:** the new line appears in the simulator within ~1s. Same
   no-restart behavior as Test 1.

## Test 3 — edit an interpolated template

1. Find a key whose value contains a `{{placeholder}}`, e.g.
   `greeting: "Hello, {{name}}"`.
2. Edit the surrounding text (not the placeholder name): `"Hi there, {{name}}!"`.
3. Save.
4. **Expected:** the rendered string updates in place, with the same
   interpolation value continuing to flow through.

## Test 4 — toggle to non-primary language

1. Run `bun translate-sheet generate` once so translations for `es` (or
   whichever non-primary you have configured) exist on disk.
2. In the simulator, switch the app's language to `es` (the example app
   exposes a toggle).
3. **Expected:** the screen re-renders with the Spanish strings; subsequent
   primary-language source edits while in `es` mode do **not** change the
   displayed text (this is the documented contract — non-primary values come
   from i18next data, not the source literal).

## What "fail" looks like

- The simulator shows the **old** string after a save → the runtime is
  caching past a re-evaluation, or Fast Refresh is being skipped.
- The simulator shows a blank screen / red box → a runtime error fired during
  the re-evaluation (often a stale reference; check the Metro log).
- Listener count grows in dev menu → the listener-leak regression has come
  back. Run `bun test tests/TranslateSheet.test.tsx` to confirm the unit
  regression test still passes.
