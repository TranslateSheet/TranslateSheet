import { TOptions } from 'i18next';

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
    /**
     * The adapter used for localization.
     * Can be a predefined string ("i18next", "i18n-js") or a custom adapter.
     */
    adapter?: Adapter;
}
/**
 * Custom localization adapter interface for users who want to provide their own implementation.
 */
interface LocalizationAdapter {
    /**
     * Translates a given key with optional interpolation options.
     * @param key - The key for the translation.
     * @param options - Optional object containing variables for interpolation.
     * @returns The translated string.
     */
    translate: (key: string, options?: Record<string, any>) => string;
    /**
     * Sets the current language for the adapter.
     * @param language - The language to set (e.g., "en", "es").
     */
    setLanguage: (language: string) => void;
    /**
     * Gets the current language used by the adapter.
     * @returns The current language code.
     */
    getLanguage: () => string;
    /**
     * Subscribes to language change events.
     * @param callback - The callback function to be called when the language changes.
     * @returns A function to unsubscribe from the language change event.
     */
    onLanguageChange: (callback: (language: string) => void) => void;
}
/**
 * Predefined adapters supported by TranslateSheet out of the box.
 */
type PredefinedAdapters = "i18next" | "i18n-js";
/**
 * Adapter type can be either a predefined adapter string or a custom implementation.
 */
type Adapter = PredefinedAdapters | LocalizationAdapter;

declare const useLanguageChange: () => void;

type Translated<T> = {
    [K in keyof T]: T[K] extends object ? T[K] extends Function ? T[K] : Translated<T[K]> : string & ((options?: Record<string, any>, additionalOptions?: TOptions) => string);
} & {
    $useLanguageChange: typeof useLanguageChange;
};
declare const TranslateSheet: {
    init: (options: TranslateSheetConfig) => void;
    create<T extends Record<string, any>>(namespace: string, translations: T): Translated<T>;
};

export { type TranslateSheetConfig, TranslateSheet as default, useLanguageChange };
