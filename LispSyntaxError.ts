import { ILocation } from "./ILocation.ts";
import { renderLocationRange } from "./renderLocationRange.ts";
import { colors } from "./deps.ts";
import { ILocatedLexem } from "./ILocatedLexem.ts";
import { ILocationRange } from "./ILocationRange.ts";
import { renderColoredExpression } from "./renderExpression.ts";
import { LispExpression } from "./ast.ts";
import { renderLexem } from "./renderLexem.ts";

export class LispSyntaxError extends Error implements ILocationRange {
  public start: ILocation;
  public end: ILocation;
  private innerMessage: string;
  constructor(
    innerMessage: string,
    start: ILocation,
    end = start,
  ) {
    super(
      `${renderLocationRange(start, end)} :: LispSyntaxError: ${innerMessage}`,
    );
    this.start = start;
    this.end = end;
    this.innerMessage = innerMessage;
  }
  static fromLocatedLexem(
    message: string,
    lexem: ILocatedLexem,
  ): LispSyntaxError {
    return new LispSyntaxError(
      `Lexem:\n\t"${renderLexem(lexem.lexem)}"\n${message}.`,
      lexem.start,
      lexem.end,
    );
  }
  static fromExpression(
    message: string,
    expression: LispExpression,
  ): LispSyntaxError {
    return new LispSyntaxError(
      `Expression:\n\t${renderColoredExpression(expression)}\n${
        colors.red("SyntaxError:")
      }\n\t${message}`,
      expression.start,
      expression.end,
    );
  }
  static fromLocationRange(
    message: string,
    range: ILocationRange,
  ): LispSyntaxError {
    return new LispSyntaxError(message, range.start, range.end);
  }
  log(): void {
    console.error(
      `${this.innerMessage}\nat:\n\t${
        colors.gray(renderLocationRange(this.start, this.end))
      }`,
    );
  }
}
