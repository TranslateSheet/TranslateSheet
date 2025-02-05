// Create a simple event emitter for language changes
const languageChangeEmitter = {
    listeners: new Set(),
    emit() {
        this.listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
            return undefined; // Ensure void return type
        };
    },
};
export default languageChangeEmitter;
