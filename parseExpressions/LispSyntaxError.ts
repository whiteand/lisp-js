import { ILocation } from "../ILocation.ts";
import { renderLocationRange } from "../renderLocationRange.ts";
import { colors } from "../deps.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { ILocationRange } from "../ILocationRange.ts";

export class LispSyntaxError extends Error implements ILocationRange {
  public start: ILocation;
  public end: ILocation;
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
