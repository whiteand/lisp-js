import { assert } from "./assert.ts";
import { IBackableIterator } from "./IBackableIterator.ts";

export interface IHistoryIterator<T> extends IBackableIterator<T> {
  getEntries(): IteratorYieldResult<T>[];
  getNextEntryIndex(): number;
  getLastValue(): T;
  peek(): IteratorResult<T>;
}

export function createBackableIterator<T>(
  iter: Iterator<T>,
  initialEntries: IteratorYieldResult<T>[] = [],
  initialNextEntryIndex = 0,
): IHistoryIterator<T> {
  const entries: IteratorYieldResult<T>[] = initialEntries;
  let nextEntryIndex = initialNextEntryIndex;
  return {
    next() {
      if (nextEntryIndex < entries.length) {
        return entries[nextEntryIndex++];
      }
      const item = iter.next();
      if (item.done) {
        return item;
      }
      entries.push(item);
      nextEntryIndex = entries.length;
      return item;
    },
    peek() {
      const res = this.next();
      this.back();
      return res;
    },
    back() {
      assert(nextEntryIndex > 0, "cannot go back. Beginning encountered");
      nextEntryIndex--;
    },
    getEntries() {
      return entries;
    },
    getNextEntryIndex() {
      return nextEntryIndex;
    },
    getLastValue() {
      assert(entries.length > 0, "There is no last entry");
      const res = entries[entries.length - 1];
      return res.value;
    },
  };
}
