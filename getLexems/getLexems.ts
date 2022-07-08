import { ILocatedChar } from "../ICharWithPosition.ts";
import { ILocation } from "../ILocation.ts";
import { IteratorWithHistory } from "../withHistory.ts";
import { LexicalError } from "./LexicalError.ts";
import {
  isDigit,
  isIdCharacter,
  isIdStartCharacter,
  isSpace,
} from "./utils.ts";

type TLexem = "(" | ")" | "+" | "*" | " " | number | bigint | {
  type: "identifier";
  value: string;
};

interface ILexem {
  lexem: TLexem;
  start: ILocation;
  end: ILocation;
}

const INITIAL = 1;

function makeLexem(lexem: TLexem, start: ILocation, end: ILocation): ILexem {
  return {
    lexem,
    start: {
      column: start.column,
      line: start.line,
      source: start.source,
    },
    end: {
      column: end.column,
      line: end.line,
      source: end.source,
    },
  };
}

function toNumericLexem(str: string, start: ILocatedChar, end: ILocatedChar) {
  if (str.includes(".")) return makeLexem(Number.parseFloat(str), start, end);
  if (str.length >= "2147483648".length) {
    return makeLexem(BigInt(str), start, end);
  }
  return makeLexem(Number.parseInt(str, 10), start, end);
}

function* parseNumber(
  input: IteratorWithHistory<ILocatedChar>,
  startLocatedChar: ILocatedChar,
) {
  let str = startLocatedChar.char;
  let end = startLocatedChar;
  let hasDot = false;
  while (true) {
    const { value, done } = input.next();
    if (done) {
      return;
    }
    if (isDigit(value.char)) {
      str += value.char;
      end = value;
    } else if (value.char === "." && !hasDot) {
      hasDot = true;
      str += value.char;
    } else {
      input.back();
      break;
    }
  }
  yield toNumericLexem(str, startLocatedChar, end);
}

export function* getLexems(
  input: IteratorWithHistory<ILocatedChar>,
): Generator<ILexem, void, unknown> {
  const state = INITIAL;
  nextChar:
  while (true) {
    const entry = input.next();
    if (entry.done) return;
    const locatedChar = entry.value;
    const char = locatedChar.char;

    if (state === INITIAL) {
      if (isSpace(char)) {
        input.forgetAllPrevious();

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
        yield* parseNumber(input, locatedChar);
        input.forgetAllPrevious();
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
            input.forgetAllPrevious();
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
