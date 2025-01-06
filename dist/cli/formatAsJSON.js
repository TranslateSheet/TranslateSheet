"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Generate a JSON string with properly formatted content.
 */
const formatAsJSON = (content) => {
    return JSON.stringify(content, null, 2);
};
exports.default = formatAsJSON;
