/**
 * Generate a JSON string with properly formatted content.
 * making a small change
 */
const formatAsJSON = (content: Record<string, any>): string => {
  return JSON.stringify(content, null, 2);
};

export default formatAsJSON;
