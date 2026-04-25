/**
 * Mirror of the backend's flattenContentMiddleware: walks a nested
 * `{ namespace: { key: value } }` structure and emits one `{ namespace, key }`
 * pair per leaf. Used to compute the set of keys we expect a target language
 * to contain when polling the backend for completion.
 */
const flattenContent = (
  content: Record<string, Record<string, string>>
): Array<{ namespace: string; key: string }> => {
  const out: Array<{ namespace: string; key: string }> = [];
  for (const [namespace, keys] of Object.entries(content)) {
    if (!keys || typeof keys !== "object") continue;
    for (const key of Object.keys(keys)) {
      out.push({ namespace, key });
    }
  }
  return out;
};

export default flattenContent;
