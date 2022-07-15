import { LispExpression } from "../ast.ts";

export function isLiteral(expr: LispExpression): boolean {
  if(expr.nodeType === "String")
    return true;
  if(expr.nodeType === "BigInt")
    return true;
  if(expr.nodeType === "List")
    return false;
  if(expr.nodeType === "Number")
    return true;
  if(expr.nodeType === "Symbol")
    return false;
  if(expr.nodeType === "Vector")
    return expr.elements.every(isLiteral);
  if(expr.nodeType === "Void")
    return true;
  return true;
}
