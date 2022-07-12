import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { SPAN } from "./constants.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { BinaryOperatorString, isBinaryOperator } from "./isBinaryOperator.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

const DEFAULT_BINARY_OPERATOR_VALUE = new Map<string, number>();
DEFAULT_BINARY_OPERATOR_VALUE.set("+", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("-", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("*", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("/", 1);
DEFAULT_BINARY_OPERATOR_VALUE.set("**", 1);

export function binaryOperatorFunctionCallToJsExpression(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
  invariant(expr.elements[0].nodeType === "Symbol", "impossible state", expr);
  const lispOperator = expr.elements[0].name;
  invariant(isBinaryOperator(lispOperator), "impossible state", expr);
  if (expr.elements.length === 2) {
    if (lispOperator === "/") {
      return {
        type: "BinaryExpression",
        operator: `/`,
        left: {
          type: "NumericLiteral",
          span: SPAN,
          value: 1,
        },
        right: lispExpressionToJsExpression(
          state,
          blockStatementList,
          expr.elements[1],
        ),
        span: SPAN,
      };
    }
    // There is only one argument
    return lispExpressionToJsExpression(
      state,
      blockStatementList,
      expr.elements[1],
    );
  }
  if (expr.elements.length === 1) {
    const defaultValue = DEFAULT_BINARY_OPERATOR_VALUE.get(lispOperator);
    invariant(
      defaultValue != null,
      "this operator should have at least one argument",
      expr,
    );
    return {
      type: "NumericLiteral",
      span: SPAN,
      value: defaultValue,
    };
  }
  const operator = operatorToJsOperator(lispOperator);

  const root: swcType.Expression = {
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
    const jsExpr = lispExpressionToJsExpression(state, blockStatementList, arg);
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
  res.left = lispExpressionToJsExpression(
    state,
    blockStatementList,
    expr.elements[1],
  );
  res.right = lispExpressionToJsExpression(
    state,
    blockStatementList,
    expr.elements[2],
  );

  return root;
}

function operatorToJsOperator(
  operator: BinaryOperatorString,
): swcType.BinaryOperator {
  if (operator === "and") return "&&";
  if (operator === "or") return "||";
  return operator;
}
