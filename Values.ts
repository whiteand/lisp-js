export type Values<T> = T extends readonly (infer X)[] ? X : T[keyof T];
