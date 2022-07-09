import { ILocatedChar } from "./ILocatedChar.ts";
import { SourceLocation } from "./SourceLocation.ts";

export class LocatedChar extends SourceLocation implements ILocatedChar {
  public char: string;
  constructor(source: string, line: number, column: number, char: string) {
    super(source, line, column);
    this.char = char;
  }
  toString() {
    return `${super.toString()} :: "${this.char}"`;
  }
}
