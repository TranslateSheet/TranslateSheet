import { TOptions } from 'i18next';

type Translated<T> = {
    [K in keyof T]: T[K] extends object ? T[K] extends Function ? T[K] : Translated<T[K]> : string & ((options?: Record<string, any>, additionalOptions?: TOptions) => string);
};
declare const TranslateSheet: {
    create<T extends Record<string, any>>(namespace: string, translations: T): Translated<T>;
};

export { TranslateSheet as default };
