import { ISymbol } from "../ast.ts";

export function getMethodNameFromMemberSymbol(methodExpr: ISymbol): string {
  return methodExpr.name.slice(1);
}
