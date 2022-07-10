import { LispExpression } from "../ast.ts";
import { Argument, Expression } from "../js-ast/swc.ts";
import { invariant } from "../syntaxInvariant.ts";
import { addStdLibExport } from "./addStdLibExport.ts";
import { addStdLibImport } from "./addStdLibImport.ts";
import { binaryOperatorFunctionCallToJsExpression } from "./binaryOperatorFunctionCallToJsExpression.ts";
import { SPAN } from "./constants.ts";
import { isBinaryOperator } from "./isBinaryOperator.ts";
import { isStdLibFunction } from "./isStdLibFunction.ts";
import { ICompilerState } from "./types.ts";

export function lispExpressionToJsExpression(
  state: ICompilerState,
  expr: LispExpression,
): Expression {
  if (expr.nodeType === "List") {
    invariant(
      expr.elements.length > 0,
      "empty lists are not supported yet",
      expr,
    );
    const funcExpression = expr.elements[0];
    if (funcExpression.nodeType === "Symbol") {
      const functionName = funcExpression.name;
      if (isBinaryOperator(functionName)) {
        return binaryOperatorFunctionCallToJsExpression(state, expr);
      }

      const definition = state.indexJs.scope.getDefinition(functionName);

      if (!definition) {
        if (isStdLibFunction(functionName)) {
          if (!state.stdLib.scope.getDefinition(functionName)) {
            addStdLibExport(state, funcExpression);
          }
          addStdLibImport(state, funcExpression);
        } else {
          invariant(
            false,
            "user defined functions not supported yet",
            expr,
          );
        }
      }

      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          optional: false,
          span: SPAN,
          value: funcExpression.name,
        },
        arguments: expr.elements.slice(1).map((arg): Argument => ({
          expression: lispExpressionToJsExpression(state, arg),
        })),
        span: SPAN,
      };
    }
  }
  if (expr.nodeType === "Number") {
    return {
      type: "NumericLiteral",
      value: expr.value,
      span: SPAN,
    };
  }
  invariant(false, "cannot compile to js", expr);
}
