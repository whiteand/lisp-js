export interface IBackableIterator<T> {
  next(): IteratorResult<T, void>;
  back(): void;
}
