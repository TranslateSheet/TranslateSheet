"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNamespaceRegistry = void 0;
const namespaceRegistry = new Set();
let lastUpdated = Date.now(); // Track the last update time
// TODO:
const handleNamespaceRegistry = ({ namespace }) => {
    // Check if this is a likely hot reload
    if (process.env.NODE_ENV === "development" && Date.now() - lastUpdated < 1000) {
        namespaceRegistry.clear(); // Clear the registry if recently updated
    }
    if (namespaceRegistry.has(namespace)) {
        console.warn(`[TranslateSheet] Duplicate namespace detected: "${namespace}". This may be caused by hot reloading.`);
        return; // Skip re-registering to avoid errors during hot reloads
    }
    // Register the namespace
    namespaceRegistry.add(namespace);
    lastUpdated = Date.now(); // Update the last update time
};
exports.handleNamespaceRegistry = handleNamespaceRegistry;
