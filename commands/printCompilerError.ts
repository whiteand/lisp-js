import { LexicalError } from "../getLexems/LexicalError.ts";
import { IColors } from "../IColors.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { formatStack } from "../utils/formatStack.ts";

export function printCompilerError(
  compilerArgs: ICompilerArgs,
  error: unknown,
  colors: IColors,
) {
  if (error instanceof LexicalError) {
    error.log(colors);
    if (compilerArgs.showStack) {
      console.log(colors.blue("Stack:"));
      console.log(formatStack(error.stack));
    }
  } else if (error instanceof LispSyntaxError) {
    error.log(colors);
    if (compilerArgs.showStack) {
      console.log(colors.blue("Stack:"));
      console.log(formatStack(error.stack));
    }
  } else {
    console.error((error as any)?.message || "unknown error");
    const stack = formatStack((error as any).stack);
    console.error(stack);
  }
}
