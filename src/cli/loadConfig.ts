import { existsSync } from "fs";
import path from "path";

/**
 * Load TranslateSheet configuration from a file.
 */
const loadConfig = (configPath = "./translateSheetConfig.js") => {
  if (existsSync(configPath)) {
    try {
      const config = require(path.resolve(configPath));
      return config.translateSheetConfig;
    } catch (error) {
      console.error(`Failed to load config file at ${configPath}:`, error);
      process.exit(1);
    }
  }
  return {};
};

export default loadConfig
