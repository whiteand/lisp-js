import { ILocation } from "./ILocation.ts";
import { renderLocation } from "./renderLocation.ts";

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
    return renderLocation(this);
  }
}
