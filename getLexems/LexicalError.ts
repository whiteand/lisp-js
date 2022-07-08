import { ILocation } from "../ILocation.ts";

export class LexicalError extends Error {
  public source: string;
  public line: number;
  public column: number;
  constructor(
    message: string,
    { source, line, column }: ILocation,
  ) {
    super(`${source}:${line}:${column} :: ${message}`);
    this.line = line;
    this.source = source;
    this.column = column;
  }
}
