"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const glob = __importStar(require("glob"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
/**
 * Extract translations from the codebase.
 * @returns {Record<string, any>} An object containing translations grouped by namespace.
 */
const extractTranslations = () => {
    const files = glob.sync("**/*.{ts,tsx,js,jsx,mjs,cjs,json,mdx}");
    const translations = {};
    files.forEach((file) => {
        const filePath = path_1.default.resolve(file);
        // Skip directories
        if (fs_1.default.statSync(filePath).isDirectory()) {
            return;
        }
        const content = fs_1.default.readFileSync(filePath, "utf-8");
        const regex = /TranslateSheet\.create\("([^"]+)",\s*({[\s\S]*?})\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const namespace = match[1];
            const translationObject = eval(`(${match[2]})`);
            if (!translations[namespace]) {
                translations[namespace] = {};
            }
            Object.assign(translations[namespace], translationObject);
        }
    });
    return translations;
};
exports.default = extractTranslations;
