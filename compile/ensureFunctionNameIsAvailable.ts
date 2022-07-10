import { ISymbol } from "../ast.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { ensureStdLibFunctionImported } from "./ensureStdLibFunctionImported.ts";
import { isStdLibFunction } from "./isStdLibFunction.ts";
import { ICompilerState } from "./types.ts";

export function ensureFunctionNameIsAvailable(
  state: ICompilerState,
  funcExpr: ISymbol): void {
  const { name } = funcExpr;
  if(isStdLibFunction(name)) {
    ensureStdLibFunctionImported(state, funcExpr);
    return;
  }
  throw LispSyntaxError.fromExpression(
    "cannot ensure function is defined",
    funcExpr
  );
}
