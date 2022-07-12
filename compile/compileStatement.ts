import { IList, ISymbol } from "../ast.ts";
import { swcType } from "../deps.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { invariant } from "../syntaxInvariant.ts";
import { SPAN } from "./constants.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

function isControlFlowOperator(_: ISymbol) {
  // TODO: Add control flow operator here
  return false;
}

export function compileStatement(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
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
        const jsValue = lispExpressionToJsExpression(
          state,
          blockStatementList,
          value,
        );
        const constStatement: swcType.Statement = {
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

        blockStatementList.define(symbol.name, {
          definitionType: "Const",
          declaration: expr,
          value,
        }, expr);

        blockStatementList.append(constStatement);

        return;
      }
      invariant(false, "Scope operators not supported yet", func);
    }
    if (isControlFlowOperator(func)) {
      invariant(false, "Control flow operators not supported", func);
    }
    const jsExpression = lispExpressionToJsExpression(
      state,
      blockStatementList,
      expr,
    );
    const expressionStatement: swcType.Statement = {
      type: "ExpressionStatement",
      span: SPAN,
      expression: jsExpression,
    };
    blockStatementList.append(expressionStatement);
    return;
  }
  invariant(false, "invalid global statement", expr);
}
