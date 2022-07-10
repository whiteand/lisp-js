import { IList } from "../ast.ts";
import { Statement } from "../js-ast/swc.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { appendStatement } from "./appendStatement.ts";
import { ensureFunctionNameIsAvailable } from "./ensureFunctionNameIsAvailable.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";
import { SPAN } from "./constants.ts";

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
    ensureFunctionNameIsAvailable(state, func);
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
