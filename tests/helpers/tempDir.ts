// Temp-directory + cwd lifecycle for tests that need to point file-glob /
// fs.readFileSync code at a controlled set of input files.
//
// Pattern (mirrors what was already inlined in extractTranslateSheetObjects
// and getMergedConfig tests, deduplicated here):
//
//   const tmp = createTempDir("my-suite");
//   beforeAll(() => tmp.enter());
//   afterAll(() => tmp.cleanup());
//   beforeEach(() => tmp.reset({ "src/foo.ts": `...` }));
//
// `enter` chdirs into a fresh empty directory; `reset` wipes & rewrites the
// file tree; `cleanup` chdirs back and removes the directory.

import fs from "fs";
import path from "path";

type TempDir = {
  dir: string;
  enter: () => void;
  cleanup: () => void;
  reset: (fileMap?: Record<string, string>) => void;
};

const ensureDir = (p: string) => {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
};

export const createTempDir = (suffix: string): TempDir => {
  const dir = path.join(process.cwd(), `test-temp-${suffix}`);
  let originalCwd = "";

  const writeFiles = (fileMap: Record<string, string>) => {
    for (const relativePath of Object.keys(fileMap)) {
      const fullPath = path.join(dir, relativePath);
      ensureDir(path.dirname(fullPath));
      fs.writeFileSync(fullPath, fileMap[relativePath]);
    }
  };

  return {
    dir,
    enter: () => {
      originalCwd = process.cwd();
      ensureDir(dir);
      process.chdir(dir);
    },
    cleanup: () => {
      if (originalCwd) process.chdir(originalCwd);
      if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
    },
    reset: (fileMap = {}) => {
      ensureDir(dir);
      for (const entry of fs.readdirSync(dir)) {
        fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
      }
      writeFiles(fileMap);
    },
  };
};
