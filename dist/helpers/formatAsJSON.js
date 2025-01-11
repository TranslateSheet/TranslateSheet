/**
 * Generate a JSON string with properly formatted content.
 */
const formatAsJSON = (content) => {
    return JSON.stringify(content, null, 2);
};
export default formatAsJSON;
