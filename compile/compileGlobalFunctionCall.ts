import { IList, ISymbol } from "../ast.ts";
import { Statement } from "../js-ast/swc.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { appendStatement } from "./appendStatement.ts";
import { SPAN } from "./constants.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

function isScopeOperator(_: ISymbol) {
  // TODO: Add scope operator here
  return false;
}

function isControlFlowOperator(_: ISymbol) {
  // TODO: Add control flow operator here
  return false;
}

export function compileGlobalFunctionCall(
  state: ICompilerState,
  expr: IList,
): void {
  const { elements } = expr;
  if (elements.length <= 0) {
    throw LispSyntaxError.fromExpression("empty lists are not supported", expr);
  }
  const func = elements[0];
  if (func.nodeType === "Symbol") {
    if (isScopeOperator(func)) {
      throw LispSyntaxError.fromExpression(
        "Scope operators not supported",
        func,
      );
    }
    if (isControlFlowOperator(func)) {
      throw LispSyntaxError.fromExpression(
        "Control flow operators not supported",
        func,
      );
    }
    const jsExpression = lispExpressionToJsExpression(state, expr);
    const expressionStatement: Statement = {
      type: "ExpressionStatement",
      span: SPAN,
      expression: jsExpression,
    };
    appendStatement(state.indexJs.ast, expressionStatement);
    return;
  }
  throw LispSyntaxError.fromExpression(`cannot transform`, expr);
}
