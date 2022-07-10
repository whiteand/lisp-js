import { ColorsContext } from "../contexts/colors.ts";
import { LexicalError } from "../getLexems/LexicalError.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { formatStack } from "../utils/formatStack.ts";

export function printCompilerError(
  compilerArgs: ICompilerArgs,
  error: unknown,
) {
  const colors = ColorsContext.getValue();
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
    // deno-lint-ignore no-explicit-any
    console.error((error as any)?.message || "unknown error");
    // deno-lint-ignore no-explicit-any
    const stack = formatStack((error as any).stack);
    console.error(stack);
  }
}
