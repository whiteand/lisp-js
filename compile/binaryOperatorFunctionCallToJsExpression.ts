import { IList, LispExpression } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { SPAN } from "./constants.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { declareVar } from "./declareVar.ts";
import { equalityOperator } from "./equalityOperator.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { BinaryOperatorString, isBinaryOperator } from "./isBinaryOperator.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { symbolToId } from "./symbolToIdentifier.ts";
import { ICompilerState } from "./types.ts";

const DEFAULT_BINARY_OPERATOR_VALUE = new Map<string, number>();
DEFAULT_BINARY_OPERATOR_VALUE.set("+", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("-", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("*", 0);
DEFAULT_BINARY_OPERATOR_VALUE.set("/", 1);
DEFAULT_BINARY_OPERATOR_VALUE.set("**", 1);

function isComparisonOperator(
  operator: BinaryOperatorString,
): operator is "<" | ">" | "<=" | ">=" {
  return operator === "<" ||
    operator === ">" || operator === "<=" || operator === ">=";
}

function isPrimitive(
  expr: LispExpression,
): expr is LispExpression {
  if (expr.nodeType === "BigInt") return true;
  if (expr.nodeType === "Number") return true;
  if (expr.nodeType === "String") return true;
  if (expr.nodeType === "Void") return true;
  return false;
}

export function binaryOperatorFunctionCallToJsExpression(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
  const { elements } = expr;
  const lispOperatorSymbol = elements[0];
  invariant(lispOperatorSymbol.nodeType === "Symbol", "impossible state", expr);
  const lispOperator = lispOperatorSymbol.name;
  invariant(isBinaryOperator(lispOperator), "impossible state", expr);
  if (lispOperator === "=") {
    invariant(elements.length === 3, "= takes two arguments", expr);
    if (isPrimitive(elements[1]) || isPrimitive(elements[2])) {
      return {
        type: "BinaryExpression",
        span: SPAN,
        operator: "===",
        left: lispExpressionToJsExpression(
          state,
          blockStatementList,
          elements[1],
        ),
        right: lispExpressionToJsExpression(
          state,
          blockStatementList,
          elements[2],
        ),
      };
    }
    return equalityOperator(state, blockStatementList, expr);
  }
  if (lispOperator === "!=") {
    invariant(elements.length === 3, "= takes two arguments", expr);
    if (isPrimitive(elements[1]) || isPrimitive(elements[2])) {
      return {
        type: "BinaryExpression",
        span: SPAN,
        operator: "!==",
        left: lispExpressionToJsExpression(
          state,
          blockStatementList,
          elements[1],
        ),
        right: lispExpressionToJsExpression(
          state,
          blockStatementList,
          elements[2],
        ),
      };
    }
    return lispExpressionToJsExpression(state, blockStatementList, {
      start: expr.start,
      end: expr.end,
      nodeType: "List",
      elements: [
        { ...lispOperatorSymbol, nodeType: "Symbol", name: "not" },
        {
          ...expr,
          nodeType: "List",
          elements: [
            { ...lispOperatorSymbol, name: "=" },
            ...expr.elements.slice(1),
          ],
        },
      ],
    });
  }
  const operator = operatorToJsOperator(lispOperator);
  if (elements.length === 1) {
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
  if (elements.length === 2) {
    invariant(
      !isComparisonOperator(lispOperator),
      "this operator requires at least 2 arguments",
      expr,
    );
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
          elements[1],
        ),
        span: SPAN,
      };
    }
    // There is only one argument
    return lispExpressionToJsExpression(
      state,
      blockStatementList,
      elements[1],
    );
  }

  if (elements.length <= 3) {
    // Just 2 arguments, like (+ 1 2)
    const root: swcType.Expression = {
      type: "BinaryExpression",
      span: SPAN,
      operator,
      left: lispExpressionToJsExpression(
        state,
        blockStatementList,
        elements[1],
      ),
      right: lispExpressionToJsExpression(
        state,
        blockStatementList,
        elements[2],
      ),
    };
    return root;
  }
  if (isComparisonOperator(lispOperator)) {
    const placeholder = blockStatementList.appendPlaceholder(expr);
    const resJs = createIdentifier("_DUMMY_RES_");
    blockStatementList.defer(() => {
      const paramsJs: swcType.Expression[] = [];
      for (let i = 1; i < elements.length; i++) {
        const param = elements[i];
        if (!param) continue;
        if (param.nodeType === "Symbol") {
          paramsJs.push(createIdentifier(symbolToId(param.name)));
        } else if (param.nodeType === "Number") {
          paramsJs.push({
            type: "NumericLiteral",
            span: SPAN,
            value: param.value,
          });
        } else if (param.nodeType === "String") {
          paramsJs.push({
            type: "StringLiteral",
            span: SPAN,
            value: param.value,
            hasEscape: param.hasEscape,
          });
        } else {
          const paramName = placeholder.defineRandom({
            definitionType: "ChainComparisonParam",
          });
          const paramJs = createIdentifier(paramName);
          paramsJs.push(paramJs);
          placeholder.append(
            declareVar(
              "const",
              paramJs,
              lispExpressionToJsExpression(state, placeholder, param),
            ),
          );
        }
      }
      const resName = placeholder.defineRandom({
        definitionType: "ChainComparisonResult",
      });
      resJs.value = resName;
      const rootExpression: swcType.BinaryExpression = {
        type: "BinaryExpression",
        operator: "&&",
        left: {
          type: "BooleanLiteral",
          value: true,
          span: SPAN,
        },
        right: {
          type: "BooleanLiteral",
          value: true,
          span: SPAN,
        },
        span: SPAN,
      };
      let currentExpr: swcType.BinaryExpression = rootExpression;
      let rightInd = paramsJs.length - 1;
      while (rightInd > 2) {
        const rightParam = paramsJs[rightInd--];
        const leftParam = paramsJs[rightInd];
        currentExpr.right = {
          type: "BinaryExpression",
          span: SPAN,
          operator,
          left: leftParam,
          right: rightParam,
        };
        currentExpr.left = {
          type: "BinaryExpression",
          span: SPAN,
          operator: "&&",
          left: {
            type: "BooleanLiteral",
            value: true,
            span: SPAN,
          },
          right: {
            type: "BooleanLiteral",
            value: true,
            span: SPAN,
          },
        };
        currentExpr = currentExpr.left;
      }
      currentExpr.right = {
        type: "BinaryExpression",
        span: SPAN,
        operator,
        right: paramsJs[rightInd--],
        left: paramsJs[rightInd],
      };
      currentExpr.left = {
        type: "BinaryExpression",
        span: SPAN,
        operator,
        right: paramsJs[rightInd--],
        left: paramsJs[rightInd],
      };

      placeholder.append(
        declareVar("const", resJs, rootExpression),
      );

      placeholder.close();
    });
    return resJs;
  }

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

  let i = elements.length - 1;
  while (i >= 3) {
    const arg = elements[i];
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
    elements[1],
  );
  res.right = lispExpressionToJsExpression(
    state,
    blockStatementList,
    elements[2],
  );

  return root;
}

function operatorToJsOperator(
  operator: BinaryOperatorString,
): swcType.BinaryOperator {
  if (operator === "and") return "&&";
  if (operator === "or") return "||";
  if (operator === "!=") return "!==";
  if (operator === "=") return "===";
  return operator;
}
