"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizeLanguage = (lang) => lang.replace(/-/g, "_");
exports.default = sanitizeLanguage;
