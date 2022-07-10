import { IList, LispExpression } from "../ast.ts";
import { getMethodNameFromMemberSymbol } from "../compile/getMethodNameFromMemberSymbol.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { IScope } from "../Scope.ts";
import { invariant } from "../syntaxInvariant.ts";
import { evaluate } from "./evaluate.ts";

export function evaluateMethodCall(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: IList): LispExpression {
  invariant(
    e.elements.length >= 2,
    "method call should have at least two arguments",
    e
  );
  const method = e.elements[0];
  invariant(
    method.nodeType === "Symbol" && method.member,
    "method name should be a symbol with a dot before name",
    e
  );
  const obj = e.elements[1];
  const args = e.elements.slice(2);
  const objValue = evaluate(compilerArgs, scope, obj);
  const argsValues = args.map((arg) => evaluate(compilerArgs, scope, arg));

  const methodName = getMethodNameFromMemberSymbol(method);
  if(methodName === "toFixed") {
    invariant(
      objValue.nodeType === "Number",
      "toFixed can only be called on a number",
      e
    );
    invariant(
      argsValues.length === 1,
      "toFixed takes one argument",
      e
    );
    invariant(
      argsValues[0].nodeType === "Number",
      "toFixed takes number as an argument",
      e
    );
    invariant(
      Number.isInteger(argsValues[0].value),
      "toFixed takes an integer as an argument",
      e
    );
    const res = objValue.value.toFixed(argsValues[0].value);
    return {
      nodeType: "String",
      start: e.start,
      end: e.end,
      value: res,
      hasEscape: false,
    };
  }
  if(methodName === "length") {
    invariant(
      objValue.nodeType === "String" || objValue.nodeType === "List" ||
      objValue.nodeType === "Vector",
      "length can only be called on a string",
      e
    );
    let length = 0;
    if(objValue.nodeType === "String") {
      length = objValue.value.length;
    }
    if(objValue.nodeType === "List") {
      length = objValue.elements.length;
    }
    if(objValue.nodeType === "Vector") {
      length = objValue.elements.length;
    }
    return {
      nodeType: "Number",
      start: e.start,
      end: e.end,
      value: length,
    };
  }
  invariant(false, "Method call is not implemented yet", e);
}
