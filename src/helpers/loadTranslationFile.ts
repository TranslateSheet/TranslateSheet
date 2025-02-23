import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

/**
 * Loads a translation file from disk.
 *
 * Supported formats:
 * - .json : Parsed as JSON.
 * - .js   : Dynamically imported.
 *
 * ⚠️ NOTE on .ts files:
 * Currently, we do NOT support loading translation files written in TypeScript (.ts)
 * for the "push" command. This is because our bundling/runtime setup does not yet
 * include on-the-fly transpilation for .ts files in this context. We plan to add
 * support for .ts files in a future release.
 *
 * @param filePath - The relative or absolute path to the translation file.
 * @returns The exported translation object, or null if not found or unsupported.
 */
export async function loadTranslationFile(
  filePath: string
): Promise<Record<string, any> | null> {
  try {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️  File not found: ${absolutePath}`);
      return null;
    }

    if (filePath.endsWith(".json")) {
      // Read and parse JSON files.
      const raw = fs.readFileSync(absolutePath, "utf8");
      return JSON.parse(raw);
    } else if (filePath.endsWith(".js")) {
      // Dynamically import JavaScript files.
      console.log("Using dynamic import for", filePath);
      const mod = await import(pathToFileURL(absolutePath).href);
      return mod.default || mod; // support both CommonJS and ES module style exports
    } else if (filePath.endsWith(".ts")) {
      // ⚠️ TypeScript support is currently disabled.
      console.warn(
        `⚠️  .ts files are not yet supported for pushing translations. Please use .js or .json files.`
      );
      return null;
    } else {
      console.warn(`⚠️  Unsupported file extension for: ${absolutePath}`);
      return null;
    }
  } catch (err) {
    console.error(`❌ Error reading translation file at "${filePath}":`, err);
    return null;
  }
}
