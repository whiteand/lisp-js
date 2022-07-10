import { IList, ISymbol } from "../ast.ts";
import { Statement } from "../js-ast/swc.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { invariant } from "../syntaxInvariant.ts";
import { appendStatement } from "./appendStatement.ts";
import { SPAN } from "./constants.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

function isControlFlowOperator(_: ISymbol) {
  // TODO: Add control flow operator here
  return false;
}

export function compileGlobalFunctionCall(
  state: ICompilerState,
  expr: IList,
): void {
  const { elements } = expr;
  invariant(elements.length > 0, "empty lists are not supported", expr);
  const func = elements[0];
  if (func.nodeType === "Symbol") {
    if (isScopeOperatorName(func.name)) {
      invariant(false, "Scope operators not supported yet", func);
    }
    if (isControlFlowOperator(func)) {
      invariant(false, "Control flow operators not supported", func);
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
  invariant(false, "invalid global statement", expr);
}
