import { LispExpression } from "./ast.ts";
import { LispSyntaxError } from "./LispSyntaxError.ts";

export function invariant<T>(
  condition: T,
  message: string,
  expr: LispExpression,
): asserts condition {
  if (!condition) {
    throw LispSyntaxError.fromExpression(message, expr);
  }
}
