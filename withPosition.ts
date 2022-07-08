import { ILocatedChar } from "./ICharWithPosition.ts";
import { SourceLocation } from "./ILocation.ts";

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
        value: Object.assign(
          new SourceLocation(sourceFile, nextCharLine, nextCharColumn),
          {
            char: character,
          },
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
