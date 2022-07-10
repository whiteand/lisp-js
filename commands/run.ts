import { IList, ISymbol, IVoidExpression, LispExpression } from "../ast.ts";
import { isBinaryOperator } from "../compile/isBinaryOperator.ts";
import { isStdLibFunction } from "../compile/isStdLibFunction.ts";
import { StdLibFunctionName } from "../compile/types.ts";
import { ColorsContext } from "../contexts/colors.ts";
import { colors as actualColors } from "../deps.ts";
import { getLexems } from "../getLexems/getLexems.ts";
import { getLocatedCharsIterator } from "../getLocatedCharsIterator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { noColors } from "../noColors.ts";
import { parseExpressions } from "../parseExpressions/parseExpressions.ts";
import { renderColoredExpression } from "../renderExpression.ts";
import { IScope, Scope } from "../Scope.ts";
import { isScopeOperatorName } from "../ScopeOperatorName.ts";
import { SourceLocation } from "../SourceLocation.ts";
import { invariant } from "../syntaxInvariant.ts";
import { printCompilerError } from "./printCompilerError.ts";

export async function run(compilerArgs: ICompilerArgs): Promise<void> {
  const resetColorsContext = ColorsContext.provide(
    compilerArgs.colors ? actualColors : noColors,
  );
  
  const character$ = await getLocatedCharsIterator(
    compilerArgs.entrypointFilePath,
  );

  const lexem$ = getLexems(character$);

  const expression$ = parseExpressions(lexem$);

  try {
    interpret(compilerArgs, expression$);
  } catch (error) {
    const colors = compilerArgs.colors ? actualColors : noColors;
    printCompilerError(compilerArgs, error, colors);
  } finally {
    resetColorsContext();
  }
}

function interpret(
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
        renderColoredExpression,
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
