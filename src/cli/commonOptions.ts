interface OptionConfig {
  flags: string;
  description: string;
  defaultValue?: any;
}

export const commonOptions: OptionConfig[] = [
  {
    flags: "--output <output>",
    description: "Output directory",
    defaultValue: "./i18n",
  },
  {
    flags: "--primaryLanguage <primaryLanguage>",
    description: "Primary language",
    defaultValue: "en",
  },
  {
    flags: "--languages <languages>",
    description: "Comma-separated list of target languages",
  },
  {
    flags: "--fileExtension <fileExtension>",
    description: "File extension",
    defaultValue: ".ts",
  },
  { flags: "--apiKey <apiKey>", description: "TranslateSheet API key" },
  {
    flags: "--config <config>",
    description: "Path to configuration file",
    defaultValue: "./translateSheetConfig.js",
  },
  {
    flags: "--generatePrimaryLanguageFile <generatePrimaryLanguageFile>",
    description: "Generate primary language file",
  },
  {
    flags: "--projectId <projectId>",
    description: "TranslateSheet Project Id",
  },
];
