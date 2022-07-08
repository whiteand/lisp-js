// deno-lint-ignore-file no-explicit-any
export interface IteratorWithHistory<T> {
  next(): IteratorResult<T, undefined>;
  back(): IteratorResult<T, undefined>;
  forgetAllPrevious(): void
}

const DONE_ENTRY: IteratorResult<any, undefined> = {
  value: undefined,
  done: true,
};

export function withHistory<T>(
  iterable: Iterator<T>,
): IteratorWithHistory<T> {
  let memory: T[] = [];
  let index = 0;
  const resEntry: any = {
    value: undefined,
    done: true,
  };
  return {
    next() {
      if (index < 0) return DONE_ENTRY;
      if (index < memory.length) {
        resEntry.done = false;
        resEntry.value = memory[index++];
        return resEntry;
      }
      const entry = iterable.next();
      if (entry.done) {
        return entry;
      }
      memory.push(entry.value);
      index++;
      return entry;
    },
    back() {
      if (index <= 0) return DONE_ENTRY;
      if (index <= memory.length) {
        resEntry.value = memory[--index];
        resEntry.done = false;
        return resEntry;
      }
      return DONE_ENTRY;
    },
    forgetAllPrevious() {
      index = 0
      memory = []
    }
  };
}
