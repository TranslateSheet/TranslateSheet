/**
 * Detect and throw an error on duplicate namespaces.
 * @param translations The extracted translations object.
 */
declare const detectDuplicateNamespaces: (translations: Record<string, any>) => void;
export default detectDuplicateNamespaces;
