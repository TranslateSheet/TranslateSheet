import { existsSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";
import * as glob from "glob";

const CONFIG_GLOB = "**/translateSheetConfig.{js,cjs,mjs,ts}";
const IGNORE = ["node_modules/**", "dist/**", "build/**", ".git/**"];

/**
 * Search the project tree for a translateSheetConfig file. Returns the first
 * match, warning if multiple are found.
 */
export const findConfigFile = (): string | undefined => {
  const matches = glob.sync(CONFIG_GLOB, { ignore: IGNORE });
  if (matches.length === 0) return undefined;
  if (matches.length > 1) {
    console.warn(
      `⚠️  Multiple translateSheetConfig files found, using "${matches[0]}":`
    );
    matches.forEach((m) => console.warn(`   - ${m}`));
  }
  return matches[0];
};

/**
 * Load TranslateSheet configuration from a file.
 *
 * - .cjs: loaded via require()
 * - .ts: loaded via jiti (transpiles on the fly so it works in plain Node)
 * - .js / .mjs: loaded via native dynamic import
 */
const loadConfig = async (configPath = "./translateSheetConfig.js") => {
  if (!existsSync(configPath)) return {};

  try {
    const resolvedPath = path.resolve(configPath);

    if (resolvedPath.endsWith(".cjs")) {
      return require(resolvedPath);
    }

    if (resolvedPath.endsWith(".ts")) {
      const { createJiti } = await import("jiti");
      const jiti = createJiti(process.cwd() + "/", { interopDefault: true });
      const imported: any = await jiti.import(resolvedPath);
      return imported?.default || imported;
    }

    const imported = await import(pathToFileURL(resolvedPath).href);
    return imported.default || imported;
  } catch (error) {
    console.error(`Failed to load config file at ${configPath}:`, error);
    process.exit(1);
  }
};

export default loadConfig;
