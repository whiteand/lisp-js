import { LispExpression } from "./ast.ts";
import { ColorsContext } from "./contexts/colors.ts";
import { ILocatedLexem } from "./ILocatedLexem.ts";
import { ILocation } from "./ILocation.ts";
import { ILocationRange } from "./ILocationRange.ts";
import { renderExpression } from "./renderExpression.ts";
import { renderLexem } from "./renderLexem.ts";
import { renderLocationRange } from "./renderLocationRange.ts";
import { getLines } from "./utils/getLines.ts";

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
    const colors = ColorsContext.getValue();
    const innerMessage = [];
    innerMessage.push("Expression:");
    innerMessage.push("\t" + renderExpression(expression));
    innerMessage.push(colors.red("SyntaxError:"));
    const messageLines = getLines(message, 75);
    for (const line of messageLines) {
      innerMessage.push("\t" + line);
    }
    return new LispSyntaxError(
      innerMessage.join("\n"),
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
  log(colors: {
    gray: (s: string) => string;
  }): void {
    console.error(
      `${this.innerMessage}\nat:\n\t${
        colors.gray(renderLocationRange(this.start, this.end))
      }`,
    );
  }
}
