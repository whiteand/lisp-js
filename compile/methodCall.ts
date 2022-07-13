import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { SPAN } from "./constants.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { getMethodNameFromMemberSymbol } from "./getMethodNameFromMemberSymbol.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

export function methodCall(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
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
  const objectJsExpr = lispExpressionToJsExpression(
    state,
    blockStatementList,
    objectExpr,
  );
  const argsJsExpr = expr.elements.slice(2).map((argExpr) =>
    lispExpressionToJsExpression(state, blockStatementList, argExpr)
  );

  return {
    type: "CallExpression",
    callee: {
      type: "MemberExpression",
      object: objectJsExpr,
      property: createIdentifier(getMethodNameFromMemberSymbol(methodExpr)),
      span: SPAN,
    },
    arguments: argsJsExpr.map((argJsExpr) => ({
      expression: argJsExpr,
    })),
    span: SPAN,
  };
}
