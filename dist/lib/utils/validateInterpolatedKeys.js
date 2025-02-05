import extractInterpolationKeys from "./extractInterpolationKeys";
const validateInterpolatedKeys = (template, options) => {
    const requiredKeys = extractInterpolationKeys(template);
    const providedKeys = Object.keys(options);
    const invalidKeys = providedKeys.filter((key) => !requiredKeys.includes(key));
    const missingKeys = requiredKeys.filter((key) => !providedKeys.includes(key));
    if (invalidKeys.length > 0 || missingKeys.length > 0) {
        console.warn(`[TranslateSheet] Invalid interpolation parameters.\n` +
            (invalidKeys.length
                ? `Unexpected keys: ${invalidKeys.join(", ")}\n`
                : "") +
            (missingKeys.length
                ? `Missing required keys: ${missingKeys.join(", ")}`
                : ""));
    }
};
export default validateInterpolatedKeys;
