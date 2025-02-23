import { existsSync } from "fs";
import path from "path";
import { pathToFileURL } from "url";

/**
 * Load TranslateSheet configuration from a file.
 *
 * If the config file has a ".cjs" extension, it will be loaded using require().
 * Otherwise (for .js, .mjs, etc.), it is treated as an ES module and loaded via dynamic import.
 *
 * ⚠️ Note on module formats:
 * When your package.json has "type": "module", even files ending in .js
 * are treated as ES modules, and require() is not supported.
 * To work around this, either rename your config file to end with .cjs,
 * or use this dynamic import approach.
 *
 * @param configPath - The relative or absolute path to the config file.
 * @returns The loaded configuration object, or an empty object if not found.
 */
const loadConfig = async (configPath = "./translateSheetConfig.js") => {
  if (existsSync(configPath)) {
    try {
      const resolvedPath = path.resolve(configPath);
      // If the file is CommonJS (.cjs), use require().
      if (resolvedPath.endsWith(".cjs")) {
        return require(resolvedPath);
      } else {
        // Otherwise, use dynamic import.
        const imported = await import(pathToFileURL(resolvedPath).href);
        return imported.default || imported;
      }
    } catch (error) {
      console.error(`Failed to load config file at ${configPath}:`, error);
      process.exit(1);
    }
  }
  return {};
};

export default loadConfig;
