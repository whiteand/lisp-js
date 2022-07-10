import { IList } from "../ast.ts";
import { Expression } from "../js-ast/swc.ts";
import { invariant } from "../syntaxInvariant.ts";
import { SPAN } from "./constants.ts";
import { getMethodNameFromMemberSymbol } from "./getMethodNameFromMemberSymbol.ts";
import { ICompilerState } from "./types.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";

export function methodCall(state: ICompilerState, expr: IList): Expression {
  invariant(
    expr.elements.length >= 2,
    "Method call should have its object",
    expr,
  );
  const methodExpr = expr.elements[0];
  invariant(
    methodExpr.nodeType === "Symbol" && methodExpr.member,
    "Method call should have method name",
    expr,
  );
  const objectExpr = expr.elements[1];
  const objectJsExpr = lispExpressionToJsExpression(state, objectExpr);
  const argsJsExpr = expr.elements.slice(2).map((argExpr) =>
    lispExpressionToJsExpression(state, argExpr)
  );

  return {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: objectJsExpr,
      property: {
        type: "Identifier",
        optional: false,
        span: SPAN,
        value: getMethodNameFromMemberSymbol(methodExpr),
      },
      span: SPAN,
    },
    arguments: argsJsExpr.map((argJsExpr) => ({
      expression: argJsExpr,
    })),
    span: SPAN,
  };
}
