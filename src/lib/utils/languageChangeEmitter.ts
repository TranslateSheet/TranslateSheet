// Create a simple event emitter for language changes
const languageChangeEmitter = {
  listeners: new Set<() => void>(),
  emit() {
    this.listeners.forEach((listener) => listener());
  },
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
      return undefined; // Ensure void return type
    };
  },
};

export default languageChangeEmitter;
