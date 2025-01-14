const extractInterpolationKeys = (str: string): string[] => {
  const matches = str.match(/\{\{(.*?)\}\}/g) || [];
  return matches.map((m) => m.slice(2, -2).trim());
};

export default extractInterpolationKeys;
