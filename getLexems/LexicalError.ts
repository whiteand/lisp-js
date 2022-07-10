import { ILocation } from "../ILocation.ts";
import { renderLocation } from "../renderLocation.ts";

export class LexicalError extends Error {
  public source: string;
  public line: number;
  public column: number;
  private innerMessage: string;
  constructor(
    innerMessage: string,
    { source, line, column }: ILocation,
  ) {
    super(`${source}:${line}:${column} :: LexicalError: ${innerMessage}`);
    this.line = line;
    this.source = source;
    this.column = column;
    this.innerMessage = innerMessage;
  }
  log(
    colors: { gray: (s: string) => string; red: (s: string) => string },
  ): void {
    console.error(
      `${colors.gray(renderLocation(this))} :: LexicalError: ${
        colors.red(this.innerMessage)
      }`,
    );
  }
}
