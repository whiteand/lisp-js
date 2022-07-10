import { IList, ISymbol, IVoidExpression, LispExpression } from "../ast.ts";
import { isBinaryOperator } from "../compile/isBinaryOperator.ts";
import { isStdLibFunction } from "../compile/isStdLibFunction.ts";
import { StdLibFunctionName } from "../compile/types.ts";
import { getLexems } from "../getLexems/getLexems.ts";
import { getLocatedCharsIterator } from "../getLocatedCharsIterator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { parseExpressions } from "../parseExpressions/parseExpressions.ts";
import {
  renderColoredExpression,
  renderExpression,
} from "../renderExpression.ts";
import { IScope, Scope } from "../Scope.ts";
import { SourceLocation } from "../SourceLocation.ts";

interface IRunOptions {
  entrypointFilePath: string;
}

export async function run(compilerArgs: ICompilerArgs): Promise<void> {
  const character$ = await getLocatedCharsIterator(
    compilerArgs.entrypointFilePath,
  );

  const lexem$ = getLexems(character$);

  const expression$ = parseExpressions(lexem$);

  interpret(compilerArgs, expression$);
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

function invariant<T>(
  condition: T,
  message: string,
  expr: LispExpression,
): asserts condition {
  if (!condition) {
    LispSyntaxError.fromExpression(message, expr).log();
    Deno.exit(1);
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
    const definition = scope.getDefinition(e.name);
    invariant(definition, "Undefined symbol", e);
    invariant(
      definition.definitionType !== "import_from_std",
      "Unexpected calculation of imported symbol",
      e,
    );
    invariant(
      definition.definitionType !== "stdlib_export",
      "Unexpected std lib export symbol calculation",
      e,
    );

    if (definition.definitionType === "ExpressionDefinition") {
      return evaluate(compilerArgs, scope, definition.expression);
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
        compilerArgs.colors ? renderColoredExpression : renderExpression,
      ),
    );
    return VOID;
  }
  invariant(false, "Cannot execute std lib call", func);
}
