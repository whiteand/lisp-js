import { IList, ISymbol, IVoidExpression, LispExpression } from "../ast.ts";
import { getMethodNameFromMemberSymbol } from "../compile/getMethodNameFromMemberSymbol.ts";
import { isBinaryOperator } from "../compile/isBinaryOperator.ts";
import { isStdLibFunction } from "../compile/isStdLibFunction.ts";
import { StdLibFunctionName } from "../compile/types.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { renderExpression } from "../renderExpression.ts";
import { IScope, Scope } from "../Scope.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { SourceLocation } from "../SourceLocation.ts";
import { invariant } from "../syntaxInvariant.ts";

export function interpret(
  compilerArgs: ICompilerArgs,
  expression$: Iterable<LispExpression>,
) {
  const scope = new Scope(null);
  for (const expression of expression$) {
    evaluate(compilerArgs, scope, expression);
  }
}

function evaluate(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: LispExpression,
): LispExpression {
  console.log(renderExpression(e))
  if (e.nodeType === "BigInt" || e.nodeType === "Number") {
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
      definition.definitionType !== "injected_stdlib_function",
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

function evaluateBinaryOperator(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: IList,
): LispExpression {
  invariant(e.elements.length > 0, "operator expected", e);
  const operatorExpr = e.elements[0];
  invariant(
    operatorExpr.nodeType === "Symbol",
    "operator expected",
    e,
  );
  invariant(isBinaryOperator(operatorExpr.name), "operator expected", e);
  if (operatorExpr.name === "+") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if (arg.nodeType === "BigInt") {
          if (typeof acc === "bigint") {
            return acc + arg.value;
          }
          if (Number.isInteger(acc)) {
            return BigInt(acc) + arg.value;
          }
          return acc + Number.parseFloat(arg.value.toString());
        }
        if (arg.nodeType === "Number") {
          if (typeof acc === "bigint") {
            return acc + BigInt(arg.value);
          }
          return acc + arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0,
    );
    if (typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if (typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  if (operatorExpr.name === "*") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if (arg.nodeType === "BigInt") {
          if (typeof acc === "bigint") {
            return acc * arg.value;
          }
          if (Number.isInteger(acc)) {
            return BigInt(acc) * arg.value;
          }
          return acc * Number.parseFloat(arg.value.toString());
        }
        if (arg.nodeType === "Number") {
          if (typeof acc === "bigint") {
            return acc * BigInt(arg.value);
          }
          return acc * arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0,
    );
    if (typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if (typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  if (operatorExpr.name === "-") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if (arg.nodeType === "BigInt") {
          if (typeof acc === "bigint") {
            return acc - arg.value;
          }
          if (Number.isInteger(acc)) {
            return BigInt(acc) - arg.value;
          }
          return acc - Number.parseFloat(arg.value.toString());
        }
        if (arg.nodeType === "Number") {
          if (typeof acc === "bigint") {
            return acc - BigInt(arg.value);
          }
          return acc - arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0,
    );
    if (typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if (typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  if (operatorExpr.name === "/") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if (arg.nodeType === "BigInt") {
          if (typeof acc === "bigint") {
            return acc / arg.value;
          }
          if (Number.isInteger(acc)) {
            return BigInt(acc) / arg.value;
          }
          return acc / Number.parseFloat(arg.value.toString());
        }
        if (arg.nodeType === "Number") {
          if (typeof acc === "bigint") {
            return acc / BigInt(arg.value);
          }
          return acc / arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0,
    );
    if (typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if (typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  invariant(false, `cannot evaludate operator`, e);
}

const VOID: IVoidExpression = {
  nodeType: "Void",
  start: new SourceLocation("stdlib", 0, 0),
  end: new SourceLocation("stdlib", 0, 0),
};

function stdLibFunctionCall(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  func: ISymbol & { name: StdLibFunctionName },
  args: LispExpression[],
): LispExpression {
  if (func.name === "log") {
    if (args.length <= 0) {
      console.log();
      return VOID;
    }
    const res: LispExpression[] = [];
    for (const arg of args) {
      const evaluatedArg = evaluate(compilerArgs, scope, arg);
      res.push(evaluatedArg);
    }
    console.log(
      ...res.map(
        renderExpression,
      ),
    );
    return VOID;
  }
  invariant(false, "Cannot execute std lib call", func);
}

function executeScopeOperator(
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

function evaluateMethodCall(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: IList,
): LispExpression {
  invariant(
    e.elements.length >= 2,
    "method call should have at least two arguments",
    e,
  );
  const method = e.elements[0];
  invariant(
    method.nodeType === "Symbol" && method.member,
    "method name should be a symbol with a dot before name",
    e,
  );
  const obj = e.elements[1];
  const args = e.elements.slice(2);
  const objValue = evaluate(compilerArgs, scope, obj);
  const argsValues = args.map((arg) => evaluate(compilerArgs, scope, arg));

  const methodName = getMethodNameFromMemberSymbol(method);
  if (methodName === "toFixed") {
    invariant(
      objValue.nodeType === "Number",
      "toFixed can only be called on a number",
      e,
    );
    invariant(
      argsValues.length === 1,
      "toFixed takes one argument",
      e,
    );
    invariant(
      argsValues[0].nodeType === "Number",
      "toFixed takes number as an argument",
      e,
    );
    invariant(
      Number.isInteger(argsValues[0].value),
      "toFixed takes an integer as an argument",
      e,
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
  if (methodName === "length") {
    invariant(
      objValue.nodeType === "String" || objValue.nodeType === "List" ||
        objValue.nodeType === "Vector",
      "length can only be called on a string",
      e,
    );
    let length = 0;
    if (objValue.nodeType === "String") {
      length = objValue.value.length;
    }
    if (objValue.nodeType === "List") {
      length = objValue.elements.length;
    }
    if (objValue.nodeType === "Vector") {
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
