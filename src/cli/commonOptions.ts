interface OptionConfig {
  flags: string;
  description: string;
  defaultValue?: any;
}

export const commonOptions: OptionConfig[] = [
  {
    flags: "--output <output>",
    description: "Output directory",
  },
  {
    flags: "--primaryLanguage <primaryLanguage>",
    description: "Primary language",
  },
  {
    flags: "--languages <languages>",
    description: "Comma-separated list of target languages",
  },
  {
    flags: "--fileExtension <fileExtension>",
    description: "File extension",
  },
  { flags: "--apiKey <apiKey>", description: "TranslateSheet API key" },
  {
    flags: "--config <config>",
    description: "Path to configuration file",
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
