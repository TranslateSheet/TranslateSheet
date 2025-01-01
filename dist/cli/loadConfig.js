"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * Load TranslateSheet configuration from a file.
 */
const loadConfig = (configPath = "./translateSheetConfig.ts") => {
    if ((0, fs_1.existsSync)(configPath)) {
        try {
            const config = require(path_1.default.resolve(configPath));
            return config.translateSheetConfig;
        }
        catch (error) {
            console.error(`Failed to load config file at ${configPath}:`, error);
            process.exit(1);
        }
    }
    return {};
};
exports.default = loadConfig;
