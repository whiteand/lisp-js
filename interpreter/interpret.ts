import { LispExpression } from "../ast.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { Scope } from "../Scope.ts";
import { evaluate } from "./evaluate.ts";

export function interpret(
  compilerArgs: ICompilerArgs,
  expression$: Iterable<LispExpression>,
) {
  const scope = new Scope(null);
  for (const expression of expression$) {
    evaluate(compilerArgs, scope, expression);
  }
}
