import { IBackableIterator } from "../IBackableIterator.ts";
import { ILocatedChar } from "../ILocatedChar.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { makeLexem } from "./makeLexem.ts";
import { isDigit } from "./utils.ts";

function toNumericLexem(
  str: string,
  start: ILocatedChar,
  end: ILocatedChar,
): ILocatedLexem {
  if (str.includes(".")) {
    return makeLexem(Number.parseFloat(str), start, end);
  }
  if (str.length >= "2147483648".length) {
    return makeLexem(BigInt(str), start, end);
  }
  return makeLexem(Number.parseInt(str, 10), start, end);
}
export function parseNumber(
  input: IBackableIterator<ILocatedChar>,
  startLocatedChar: ILocatedChar,
): ILocatedLexem {
  let str = startLocatedChar.char;
  let end = startLocatedChar;
  let hasDot = false;
  while (true) {
    const { value, done } = input.next();
    if (done) {
      break;
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
  return toNumericLexem(str, startLocatedChar, end);
}
