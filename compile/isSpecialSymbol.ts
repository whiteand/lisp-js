import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { isBinaryOperator } from "./isBinaryOperator.ts";
import { isStdLibFunction } from "./isStdLibFunction.ts";

export function isSpecialSymbol(symbolName: string) {
  return isStdLibFunction(symbolName) || isBinaryOperator(symbolName) ||
    isScopeOperatorName(symbolName);
}
