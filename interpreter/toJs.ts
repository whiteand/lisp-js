import { LispExpression } from "../ast.ts";
import { invariant } from "../syntaxInvariant.ts";

// deno-lint-ignore no-explicit-any
export function toJs(expression: LispExpression): any {
  if (expression.nodeType === "BigInt") {
    return expression.value;
  }
  if (expression.nodeType === "List") {
    return [...expression.elements.map(toJs)];
  }
  if (expression.nodeType === "Number") {
    return expression.value;
  }
  if (expression.nodeType === "String") {
    return expression.value;
  }
  if (expression.nodeType === "Symbol") {
    return Symbol.for(expression.name);
  }
  if (expression.nodeType === "Vector") {
    return [...expression.elements.map(toJs)];
  }
  if (expression.nodeType === "Void") {
    return null;
  }
  invariant(false, "Cannot convert to js", expression);
}
