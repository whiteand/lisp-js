import { ISymbol, LispExpression } from "../ast.ts";
import { isBinaryOperator } from "../compile/isBinaryOperator.ts";
import { isStdLibFunction } from "../compile/isStdLibFunction.ts";
import { StdLibFunctionName } from "../compile/types.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { IScope } from "../Scope.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { invariant } from "../syntaxInvariant.ts";
import { evaluateBinaryOperator } from "./evaluateBinaryOperator.ts";
import { evaluateMethodCall } from "./evaluateMethodCall.ts";
import { executeScopeOperator } from "./executeScopeOperator.ts";
import { stdLibFunctionCall } from "./stdLibFunctionCall.ts";

export function evaluate(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: LispExpression,
): LispExpression {
  if (e.nodeType === "BigInt" || e.nodeType === "Number") {
    return e;
  }
  if (e.nodeType === "String") {
    return e;
  }
  if (e.nodeType === "Vector") {
    return {
      nodeType: "Vector",
      start: e.start,
      end: e.end,
      elements: e.elements.map((element) =>
        evaluate(compilerArgs, scope, element)
      ),
    };
  }
  if (e.nodeType === "Symbol") {
    if (isStdLibFunction(e.name)) {
      return e;
    }
    if (isBinaryOperator(e.name)) {
      return e;
    }
    if (isScopeOperatorName(e.name)) {
      return e;
    }
    if (e.member) {
      return e;
    }
    const definition = scope.getDefinition(e.name);
    invariant(definition, "Undefined symbol", e);
    invariant(
      definition.definitionType !== "imported_std_function",
      "Unexpected calculation of injected_function",
      e,
    );

    if (definition.definitionType === "ExpressionDefinition") {
      return evaluate(compilerArgs, scope, definition.expression);
    }

    if (definition.definitionType === "Const") {
      return definition.value;
    }

    invariant(false, "Unexpected definition type", e);
  }

  if (e.nodeType === "List") {
    invariant(e.elements.length > 0, "Empty list cannot be executed", e);
    const funcExpr = evaluate(compilerArgs, scope, e.elements[0]);
    if (funcExpr.nodeType === "Symbol") {
      if (isStdLibFunction(funcExpr.name)) {
        return stdLibFunctionCall(
          compilerArgs,
          scope,
          funcExpr as ISymbol & { name: StdLibFunctionName },
          e.elements.slice(1),
        );
      }
      if (isBinaryOperator(funcExpr.name)) {
        return evaluateBinaryOperator(compilerArgs, scope, e);
      }
      if (isScopeOperatorName(funcExpr.name)) {
        return executeScopeOperator(compilerArgs, scope, e);
      }
      if (funcExpr.member) {
        return evaluateMethodCall(compilerArgs, scope, e);
      }
    }
    invariant(false, `cannot call`, e.elements[0]);
  }
  invariant(false, `cannot evaluate`, e);
}
