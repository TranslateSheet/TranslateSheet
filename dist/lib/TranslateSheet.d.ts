import { TOptions } from "i18next";
declare const TranslateSheet: {
    create<T extends Record<string, string | ((...args: any[]) => string)>>(namespace: string, translations: T): { [K in keyof T]: T[K] extends (...args: any[]) => any ? T[K] : string & ((options?: Record<string, any>, additionalOptions?: TOptions) => string); };
};
export default TranslateSheet;
//# sourceMappingURL=TranslateSheet.d.ts.map