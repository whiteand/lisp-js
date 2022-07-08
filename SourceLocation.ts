import { ILocation } from "./ILocation.ts";

export class SourceLocation implements ILocation {
  public line: number;
  public source: string;
  public column: number;
  constructor(source: string, line: number, column: number) {
    this.line = line;
    this.source = source;
    this.column = column;
  }

  toString() {
    return `${this.source}:${this.line}:${this.column}`;
  }
}
