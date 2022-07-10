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
  isReplacableBySpace,
  isSpace,
} from "./utils.ts";
import { ILocation } from "../ILocation.ts";

const INITIAL = 1;

function getRawSourceCodeTillTheEndOfALine(
  input: IBackableIterator<ILocatedChar>,
): { comment: string; end: ILocation | null } {
  let result = "";
  let lastLocation: ILocation | null = null;
  while (true) {
    const charEntry = input.next();
    if (charEntry.done) {
      return { comment: result.trim(), end: lastLocation };
    }
    if (charEntry.value.char === "\n") {
      input.back();
      return { comment: result.trim(), end: lastLocation };
    }
    lastLocation = charEntry.value;
    result += charEntry.value.char;
  }
}

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
      if (char === "/") {
        const nextLocatedCharEntry = input.next();
        if (nextLocatedCharEntry.done) {
          throw new LexicalError("unexpected end of input", locatedChar);
        }
        if (
          nextLocatedCharEntry.value.char === "/"
        ) {
          const { comment, end } = getRawSourceCodeTillTheEndOfALine(input);
          yield makeLexem(
            {
              type: "comment",
              value: comment,
            },
            locatedChar,
            end || nextLocatedCharEntry.value,
          );
          continue nextChar
        }
        input.back()
      }
      if (char === "\n") {
        const nextCharEntry = input.next();
        let end = locatedChar
        if (nextCharEntry.done || nextCharEntry.value.char !== "\r") {
          input.back();
        } else {
          end = nextCharEntry.value;
        }
        yield makeLexem(
          {
            type: "newline",
          },
          locatedChar,
          end,
        );
        continue nextChar;
      }
      if (isReplacableBySpace(char)) {
        while (true) {
          const nextEntry = input.next();
          if (nextEntry.done) {
            break nextChar;
          }
          if (!isReplacableBySpace(nextEntry.value.char)) {
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
      if (char === "[") {
        yield makeLexem("[", locatedChar, locatedChar);
        continue;
      }
      if (char === "]") {
        yield makeLexem("]", locatedChar, locatedChar);
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
              { type: "symbol", value: id },
              locatedChar,
              end,
            );
            break nextChar;
          }
          if (!isIdCharacter(nextEntry.value.char)) {
            input.back();
            yield makeLexem(
              { type: "symbol", value: id },
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
