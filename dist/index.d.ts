import { TOptions } from 'i18next';

type Translated<T> = {
    [K in keyof T]: T[K] extends object ? T[K] extends Function ? T[K] : Translated<T[K]> : string & ((options?: Record<string, any>, additionalOptions?: TOptions) => string);
};
declare const TranslateSheet: {
    create<T extends Record<string, any>>(namespace: string, translations: T): Translated<T>;
};

declare const useLanguageChange: () => void;

type FileExtensions = ".ts" | ".js" | ".json";
interface TranslateSheetConfig {
    /** The API key used for AI-powered translations */
    apiKey: string;
    /** The id used to associate the project */
    projectId?: string;
    /** The primary language of the project (e.g., "en" for English) */
    primaryLanguage: string;
    /** An array of target languages for translation (e.g., ["es", "fr", "de"]) */
    languages: string[];
    /** The file extension for the generated translation files */
    fileExtension: FileExtensions;
    /** The output directory where the generated translation files will be saved */
    output: string;
    /** The output directory where the generated translation files will be saved */
    generatePrimaryLanguageFile: string | boolean;
}

export { type FileExtensions, type TranslateSheetConfig, TranslateSheet as default, useLanguageChange };
