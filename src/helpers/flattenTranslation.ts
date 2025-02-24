/**
 * Recursively flatten a nested translation object.
 * For example:
 * { step1: { title: "Step 1", editText: "Edit" } }
 * becomes:
 * { "step1.title": "Step 1", "step1.editText": "Edit" }
 */
export const flattenTranslations = (obj: any, prefix: string = ""): any => {
    // If it's not an object (or is null or an array), return it immediately.
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      return obj;
    }
  
    let result: Record<string, any> = {};
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        result = { ...result, ...flattenTranslations(value, newKey) };
      } else {
        result[newKey] = value;
      }
    });
    return result;
  };
  