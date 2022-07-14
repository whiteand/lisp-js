import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { appendStdLibFunctionDeclaration } from "./appendStdLibFunctionDeclaration.ts";
import { OUT_ENTRYPOINT_PATH, SPAN } from "./constants.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

const EQUALS_FUNCTION_IMPORT_NAME = "_eq_";
export function equalityOperator(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
  const def = blockStatementList.getDefinition(EQUALS_FUNCTION_IMPORT_NAME);
  const eqSymbol = expr.elements[0];
  invariant(eqSymbol.nodeType === "Symbol", "should be = symbol", eqSymbol);
  if (!def) {
    appendStdLibFunctionDeclaration(state, OUT_ENTRYPOINT_PATH, {
      ...eqSymbol,
      name: EQUALS_FUNCTION_IMPORT_NAME,
    });
  }
  return {
    type: "CallExpression",
    arguments: expr.elements.slice(1).map((arg) => ({
      expression: lispExpressionToJsExpression(state, blockStatementList, arg),
    })),
    callee: createIdentifier(EQUALS_FUNCTION_IMPORT_NAME),
    span: SPAN,
  };
}
