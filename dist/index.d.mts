import { TOptions } from 'i18next';

type Trim<S extends string> = S extends ` ${infer R}` ? Trim<R> : S extends `${infer R} ` ? Trim<R> : S;
type InterpolationKeyName<Raw extends string> = Raw extends `${infer Before},${string}` ? Trim<Before> : Trim<Raw>;
type ExtractInterpolationKeys<S extends string> = S extends `${string}{{${infer Key}}}${infer Rest}` ? InterpolationKeyName<Key> | ExtractInterpolationKeys<Rest> : never;
type InterpolationOptions<S extends string> = {
    [K in ExtractInterpolationKeys<S>]: string | number;
};
type TranslationLeaf<S extends string> = [
    ExtractInterpolationKeys<S>
] extends [never] ? string : (options: InterpolationOptions<S>, additionalOptions?: TOptions) => string;
type Translated<T> = {
    [K in keyof T]: T[K] extends string ? TranslationLeaf<T[K]> : T[K] extends object ? Translated<T[K]> : T[K];
};
declare const TranslateSheet: {
    create<const T extends Record<string, any>>(namespace: string, translations: T): Translated<T>;
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
    /**
     * Optional user-supplied OpenAI API key. When set, the backend uses this key
     * for the LLM call instead of the TranslateSheet-managed key. Not stored.
     */
    openAiKey?: string;
    /**
     * Optional user-supplied Anthropic API key. When set, the backend translates
     * via Claude using this key instead of OpenAI. Takes precedence over openAiKey.
     * Not stored.
     */
    anthropicKey?: string;
}

export { type FileExtensions, type TranslateSheetConfig, TranslateSheet as default, useLanguageChange };
