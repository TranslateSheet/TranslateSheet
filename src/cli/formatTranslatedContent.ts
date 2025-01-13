import formatAsJSON from "../helpers/formatAsJSON";
import formatAsJavaScript from "../helpers/formatAsJavaScript";
import formatAsTypeScript from "../helpers/formatAsTypeScript";
import { FileExtensions } from "../types";

const formatTranslatedContent = ({
  fileExtension,
  translatedContent,
  lang,
}: {
  fileExtension: FileExtensions;
  translatedContent: Record<string, any>;
  lang: string;
}) => {
  // Conditionally format the content based on file extension
  let formattedContent: string;
  if (fileExtension === ".js") {
    formattedContent = formatAsJavaScript(translatedContent, lang);
  } else if (fileExtension === ".ts") {
    formattedContent = formatAsTypeScript(translatedContent, lang);
  } else if (fileExtension === ".json") {
    formattedContent = formatAsJSON(translatedContent);
  } else {
    throw new Error(`Unsupported file extension: ${fileExtension}`);
  }

  return formattedContent;
};

export default formatTranslatedContent;
