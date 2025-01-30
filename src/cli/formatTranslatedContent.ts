import formatAsJSON from "../helpers/formatAsJSON";
import formatAsJavaScript from "../helpers/formatAsJavaScript";
import formatAsTypeScript from "../helpers/formatAsTypeScript";
import { FileExtensions } from "../types";

const formatTranslatedContent = ({
  fileExtension,
  translatedContent,
  targetLanguage,
}: {
  fileExtension: FileExtensions;
  translatedContent: Record<string, any>;
  targetLanguage: string;
}) => {
  // Conditionally format the content based on file extension
  let formattedContent: string;
  if (fileExtension === ".js") {
    formattedContent = formatAsJavaScript(translatedContent, targetLanguage);
  } else if (fileExtension === ".ts") {
    formattedContent = formatAsTypeScript(translatedContent, targetLanguage);
  } else if (fileExtension === ".json") {
    formattedContent = formatAsJSON(translatedContent);
  } else {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }

  return formattedContent;
};

export default formatTranslatedContent;
