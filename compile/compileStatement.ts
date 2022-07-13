import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { invariant } from "../syntaxInvariant.ts";
import { compileIfStatement } from "./compileIfStatement.ts";
import { SPAN } from "./constants.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { declareVar } from "./declareVar.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { isControlFlowOperator } from "./isControlFlowOperator.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { symbolToId } from "./symbolToIdentifier.ts";
import { ICompilerState } from "./types.ts";

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

        blockStatementList.define(symbol.name, {
          definitionType: "Const",
          declaration: expr,
          value,
        }, expr);

        blockStatementList.append(declareVar(
          "const",
          createIdentifier(symbolToId(symbol.name)),
          jsValue,
        ));

        return;
      }
      invariant(false, "Scope operators not supported yet", func);
    }
    if (isControlFlowOperator(func)) {
      if (func.name === "if") {
        invariant(
          elements.length === 4,
          "(if condition trueValue falseValue) expected",
          expr,
        );
        return compileIfStatement(state, blockStatementList, expr);
      }
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
