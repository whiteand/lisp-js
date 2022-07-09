import { ILocation } from "../ILocation.ts";
import { renderLocationRange } from "../renderLocationRange.ts";
import { colors } from "../deps.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";

export class LispSyntaxError extends Error {
  private start: ILocation;
  private end: ILocation;
  private innerMessage: string;
  constructor(
    innerMessage: string,
    start: ILocation,
    end = start,
  ) {
    super(`${renderLocationRange(start, end)} :: SyntaxError: ${innerMessage}`);
    this.start = start;
    this.end = end;
    this.innerMessage = innerMessage;
  }
  static fromLocatedLexem(message: string, lexem: ILocatedLexem): SyntaxError {
    return new LispSyntaxError(message, lexem.start, lexem.end);
  }
  log(): void {
    console.error(
      `${colors.gray(renderLocationRange(this.start, this.end))} :: ${
        colors.red("SyntaxError")
      }: ${this.innerMessage}`,
    );
  }
}
