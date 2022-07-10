import { IList, ISymbol } from "../ast.ts";
import { Statement } from "../js-ast/swc.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { invariant } from "../syntaxInvariant.ts";
import { appendToMain } from "./appendStatement.ts";
import { OUT_ENTRYPOINT_PATH, SPAN } from "./constants.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

function isControlFlowOperator(_: ISymbol) {
  // TODO: Add control flow operator here
  return false;
}

export function compileStatement(
  state: ICompilerState,
  expr: IList,
): void {
  const { elements } = expr;
  invariant(elements.length > 0, "empty lists are not supported", expr);
  const func = elements[0];
  if (func.nodeType === "Symbol") {
    if (isScopeOperatorName(func.name)) {
      if (func.name === "const") {
        // (const [symbol] [value])
        invariant(elements.length === 3, "const takes two arguments", expr);
        const symbol = elements[1];
        invariant(symbol.nodeType === "Symbol", "symbol expected", symbol);
        const value = elements[2];
        const jsValue = lispExpressionToJsExpression(state, value);
        const constStatement: Statement = {
          type: "VariableDeclaration",
          span: SPAN,
          kind: "const",
          declare: false,
          declarations: [
            {
              definite: false,
              id: {
                type: "Identifier",
                span: SPAN,
                optional: false,
                value: symbol.name,
              },
              type: "VariableDeclarator",
              span: SPAN,
              init: jsValue,
            },
          ],
        };

        state.files[OUT_ENTRYPOINT_PATH].scope.define(symbol.name, {
          definitionType: "Const",
          declaration: expr,
          value,
        }, expr);

        appendToMain(state.files[OUT_ENTRYPOINT_PATH].ast, constStatement);

        return;
      }
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
    appendToMain(state.files[OUT_ENTRYPOINT_PATH].ast, expressionStatement);
    return;
  }
  invariant(false, "invalid global statement", expr);
}
