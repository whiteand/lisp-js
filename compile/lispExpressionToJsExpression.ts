import { LispExpression } from "../ast.ts";
import { Argument, Expression } from "../js-ast/swc.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { binaryOperatorFunctionCallToJsExpression } from "./binaryOperatorFunctionCallToJsExpression.ts";
import { SPAN } from "./constants.ts";
import { isBinaryOperator } from "./isBinaryOperator.ts";
import { ICompilerState } from "./types.ts";

export function lispExpressionToJsExpression(
  state: ICompilerState,
  expr: LispExpression,
): Expression {
  if (expr.nodeType === "List") {
    if (expr.elements.length <= 0) {
      throw LispSyntaxError.fromExpression(
        "empty lists are not supported yet",
        expr,
      );
    }
    const funcExpression = expr.elements[0];
    if (funcExpression.nodeType === "Symbol") {
      const functionName = funcExpression.name;
      if (isBinaryOperator(functionName)) {
        return binaryOperatorFunctionCallToJsExpression(state, expr);
      }
      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          optional: false,
          span: SPAN,
          value: funcExpression.name,
        },
        arguments: expr.elements.slice(1).map((arg): Argument => ({
          expression: lispExpressionToJsExpression(state, arg),
        })),
        span: SPAN,
      };
    }
  }
  if (expr.nodeType === "Number") {
    return {
      type: "NumericLiteral",
      value: expr.value,
      span: SPAN,
    };
  }
  throw LispSyntaxError.fromExpression("cannot compile to js expression", expr);
}
