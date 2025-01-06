import { existsSync } from "fs";
import path from "path";

// TODO: fs and path are holding pack dynamic primary languages

/**
 * Load TranslateSheet configuration from a file.
 */
const loadConfig = (configPath = "./translateSheetConfig.js") => {
  if (existsSync(configPath)) {
    try {
      const config = require(path.resolve(configPath));
      return config;
    } catch (error) {
      console.error(`Failed to load config file at ${configPath}:`, error);
      process.exit(1);
    }
  }
  return {};
};

export default loadConfig
