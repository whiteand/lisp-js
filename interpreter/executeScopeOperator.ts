import { IList, LispExpression } from "../ast.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { IScope } from "../Scope.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { invariant } from "../syntaxInvariant.ts";
import { evaluate } from "./evaluate.ts";
import { VOID } from "./VOID.ts";

export function executeScopeOperator(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: IList,
): LispExpression {
  invariant(e.elements.length > 0, "impossible state", e);
  invariant(e.elements[0].nodeType === "Symbol", "symbol expected", e);
  invariant(
    isScopeOperatorName(e.elements[0].name),
    "scope operator name expected",
    e,
  );
  if (e.elements[0].name === "const") {
    invariant(e.elements.length === 3, "const takes 2 arguments", e);
    const name = e.elements[1];
    const value = evaluate(compilerArgs, scope, e.elements[2]);
    invariant(name.nodeType === "Symbol", "symbol expected", name);
    scope.define(name.name, {
      definitionType: "Const",
      value,
      declaration: e,
    }, e);
    return VOID;
  }
  invariant(false, "Cannot handle this scope operator", e);
}
