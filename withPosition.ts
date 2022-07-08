import { ILocatedChar } from "./ILocatedChar.ts";
import { LocatedChar } from "./LocatedChar.ts";

export function withPosition(
  sourceFile: string,
  iter: Iterator<string>,
): Iterator<ILocatedChar> {
  let nextCharLine = 1;
  let nextCharColumn = 1;
  return {
    next() {
      const entry = iter.next();
      if (entry.done) return entry;
      const character = entry.value;
      const resEntry: IteratorResult<ILocatedChar> = {
        value: new LocatedChar(
          sourceFile,
          nextCharLine,
          nextCharColumn,
          character,
        ),
        done: false,
      };
      if (character === "\n") {
        nextCharLine++;
        nextCharColumn = 1;
      } else {
        nextCharColumn++;
      }
      return resEntry;
    },
  };
}
