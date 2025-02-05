import { existsSync } from "fs";
import path from "path";

// TODO: fs and path are holding back dynamic primary languages
// TODO: I think we can just use the primary language given to i18n init

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
