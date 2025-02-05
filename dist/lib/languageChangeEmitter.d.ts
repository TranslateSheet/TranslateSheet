declare const languageChangeEmitter: {
    listeners: Set<() => void>;
    emit(): void;
    subscribe(listener: () => void): () => undefined;
};
export default languageChangeEmitter;
//# sourceMappingURL=languageChangeEmitter.d.ts.map