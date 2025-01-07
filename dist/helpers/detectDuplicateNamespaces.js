"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Detect and throw an error on duplicate namespaces.
 * @param translations The extracted translations object.
 */
const detectDuplicateNamespaces = (translations) => {
    const seenNamespaces = new Set();
    const duplicateNamespaces = [];
    Object.keys(translations).forEach((namespace) => {
        if (seenNamespaces.has(namespace)) {
            duplicateNamespaces.push(namespace);
        }
        seenNamespaces.add(namespace);
    });
    // TODO: add link to documentation for further info
    if (duplicateNamespaces.length > 0) {
        const message = `[TranslateSheet] Duplicate namespaces detected: ${duplicateNamespaces.join(", ")}. Please ensure each namespace is unique.`;
        console.error(message);
        process.exit(1); // Exit with an error code to stop the script
    }
};
exports.default = detectDuplicateNamespaces;
