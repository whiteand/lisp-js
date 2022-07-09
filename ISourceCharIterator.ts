import { ILocatedChar } from "./ILocatedChar.ts";

export interface ISourceCharIterator {
  next(): IteratorResult<ILocatedChar, void>;
  back(): void;
}
