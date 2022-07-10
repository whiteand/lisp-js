import { assert } from "../assert.ts";
import { IList } from "../ast.ts";
import { Expression } from "../js-ast/swc.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";
import { SPAN } from "./constants.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { isBinaryOperator } from "./isBinaryOperator.ts";

const DEFAULT_BINARY_OPERATOR_VALUE = new Map<string, number>();
DEFAULT_BINARY_OPERATOR_VALUE.set("+", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("-", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("*", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("/", 1);

export function binaryOperatorFunctionCallToJsExpression(
  state: ICompilerState,
  expr: IList,
): Expression {
  assert(expr.elements[0].nodeType === "Symbol", "impossible state");
  const operator = expr.elements[0].name;
  assert(isBinaryOperator(operator), "impossible state");
  if (expr.elements.length === 2) {
    if (operator === "/") {
      return {
        type: "BinaryExpression",
        operator: `/`,
        left: {
          type: "NumericLiteral",
          span: SPAN,
          value: 1,
        },
        right: lispExpressionToJsExpression(state, expr.elements[1]),
        span: SPAN,
      };
    }
    // There is only one argument
    return lispExpressionToJsExpression(state, expr.elements[1]);
  }
  if (expr.elements.length === 1) {
    const defaultValue = DEFAULT_BINARY_OPERATOR_VALUE.get(operator);
    if (defaultValue === undefined) {
      throw LispSyntaxError.fromExpression(
        "this operator has no default value",
        expr,
      );
    }
    return {
      type: "NumericLiteral",
      span: SPAN,
      value: defaultValue,
    };
  }

  const root: Expression = {
    type: "BinaryExpression",
    span: SPAN,
    operator,
    left: {
      type: "NumericLiteral",
      span: SPAN,
      value: 0,
    },
    right: {
      type: "NumericLiteral",
      span: SPAN,
      value: 0,
    },
  };
  let res = root;

  let i = expr.elements.length - 1;
  while (i >= 3) {
    const arg = expr.elements[i];
    i--;
    const jsExpr = lispExpressionToJsExpression(state, arg);
    res.right = jsExpr;
    res.left = {
      type: "BinaryExpression",
      span: SPAN,
      operator,
      left: {
        type: "NumericLiteral",
        span: SPAN,
        value: 0,
      },
      right: {
        type: "NumericLiteral",
        span: SPAN,
        value: 0,
      },
    };
    res = res.left;
  }
  res.left = lispExpressionToJsExpression(state, expr.elements[1]);
  res.right = lispExpressionToJsExpression(state, expr.elements[2]);

  return root;
}
