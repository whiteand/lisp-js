import { IBackableIterator } from "../IBackableIterator.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { ILocatedChar } from "../ILocatedChar.ts";
import { LexicalError } from "./LexicalError.ts";
import { makeLexem } from "./makeLexem.ts";
import { parseNumber } from "./parseNumber.ts";
import {
  isDigit,
  isIdCharacter,
  isIdStartCharacter,
  isSpace,
} from "./utils.ts";

const INITIAL = 1;

export function* getLexems(
  input: IBackableIterator<ILocatedChar>,
): Generator<ILocatedLexem, void, unknown> {
  const state = INITIAL;
  nextChar:
  while (true) {
    const entry = input.next();
    if (entry.done) return;
    const locatedChar = entry.value;
    const char = locatedChar.char;

    if (state === INITIAL) {
      if (isSpace(char)) {
        while (true) {
          const nextEntry = input.next();
          if (nextEntry.done) {
            break nextChar;
          }
          if (!isSpace(nextEntry.value.char)) {
            input.back();
            break;
          }
        }

        // deno-lint-ignore no-unreachable
        continue nextChar;
      }
      if (char === "(") {
        yield makeLexem("(", locatedChar, locatedChar);
        continue;
      }
      if (char === ")") {
        yield makeLexem(")", locatedChar, locatedChar);
        continue;
      }
      if (char === "+") {
        yield makeLexem("+", locatedChar, locatedChar);
        continue;
      }
      if (char === "*") {
        yield makeLexem("*", locatedChar, locatedChar);
        continue;
      }
      if (isDigit(char)) {
        const numberLexem = parseNumber(input, locatedChar);
        yield numberLexem;
        continue nextChar;
      }
      if (isIdStartCharacter(char)) {
        let id = char;
        let end = locatedChar;
        while (true) {
          const nextEntry = input.next();
          if (nextEntry.done) {
            yield makeLexem(
              { type: "identifier", value: id },
              locatedChar,
              end,
            );
            break nextChar;
          }
          if (!isIdCharacter(nextEntry.value.char)) {
            input.back();
            yield makeLexem(
              { type: "identifier", value: id },
              locatedChar,
              end,
            );
            continue nextChar;
          }
          id += nextEntry.value.char;
          end = nextEntry.value;
        }
      }
      throw new LexicalError(`unexpected character: "${char}"`, locatedChar);
    }
    throw new LexicalError(`unexpected character: ${char}`, locatedChar);
  }
}
