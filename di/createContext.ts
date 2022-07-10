interface IContext<T> {
  provide(value: T): () => void;
  getValue(): T;
}

export function createContext<T>(defaultValue: T): IContext<T> {
  let value = defaultValue;
  return {
    provide(newValue) {
      const oldValue = value;
      value = newValue;
      return () => {
        value = oldValue;
      };
    },
    getValue() {
      return value;
    },
  };
}
