/**
 * Detect and throw an error on duplicate namespaces.
 * @param translations The extracted translations object.
 */
const detectDuplicateNamespaces = (translations: Record<string, any>) => {
  const seenNamespaces = new Set<string>();
  const duplicateNamespaces: string[] = [];

  Object.keys(translations).forEach((namespace) => {
    if (seenNamespaces.has(namespace)) {
      duplicateNamespaces.push(namespace);
    }
    seenNamespaces.add(namespace);
  });

  // TODO: add link to documentation for further info
  if (duplicateNamespaces.length > 0) {
    const message = `[TranslateSheet] Duplicate namespaces detected: ${duplicateNamespaces.join(
      ", "
    )}. Please ensure each namespace is unique.`;
    console.error(message);
    process.exit(1); // Exit with an error code to stop the script
  }
};

export default detectDuplicateNamespaces;
