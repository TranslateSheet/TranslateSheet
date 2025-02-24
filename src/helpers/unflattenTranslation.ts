export function unflattenTranslations(
  flatObj: Record<string, any>
): Record<string, any> {
  const nested: Record<string, any> = {};
  for (const flatKey in flatObj) {
    let rawValue = flatObj[flatKey];
    // If the value is a string that looks like JSON, try to parse it.
    if (
      typeof rawValue === "string" &&
      rawValue.trim().startsWith("{") &&
      rawValue.trim().endsWith("}")
    ) {
      try {
        rawValue = JSON.parse(rawValue);
      } catch (e) {
        // If parsing fails, leave the value as-is.
      }
    }
    const parts = flatKey.split(".");
    let current = nested;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = rawValue;
      } else {
        if (!current[part] || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }
  return nested;
}
