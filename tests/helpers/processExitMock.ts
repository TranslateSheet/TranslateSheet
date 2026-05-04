// Stand-in for `process.exit` that throws instead of terminating the test
// process. Tests can install/restore this pair to verify code paths that exit
// with a specific status code.
//
// Usage:
//   const exitMock = mockProcessExit();
//   try {
//     someFnThatExits();
//   } catch (err) {
//     expect((err as Error).message).toBe("process.exit:1");
//   }
//   expect(exitMock.code).toBe(1);
//   exitMock.restore();

type ExitMock = {
  code: number | undefined;
  restore: () => void;
};

export const mockProcessExit = (): ExitMock => {
  const original = process.exit;
  const state: ExitMock = {
    code: undefined,
    restore: () => {
      process.exit = original;
    },
  };
  process.exit = ((code?: number) => {
    state.code = code;
    throw new Error(`process.exit:${code ?? 0}`);
  }) as typeof process.exit;
  return state;
};
