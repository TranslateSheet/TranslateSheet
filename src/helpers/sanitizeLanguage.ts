const sanitizeLanguage = (lang: string) => lang.replace(/-/g, "_");

export default sanitizeLanguage