import { IList, LispExpression } from "../ast.ts";
import { isBinaryOperator } from "../compile/isBinaryOperator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { IScope } from "../Scope.ts";
import { invariant } from "../syntaxInvariant.ts";
import { evaluate } from "./evaluate.ts";

export function evaluateBinaryOperator(
  compilerArgs: ICompilerArgs,
  scope: IScope,
  e: IList): LispExpression {
  invariant(e.elements.length > 0, "operator expected", e);
  const operatorExpr = e.elements[0];
  invariant(
    operatorExpr.nodeType === "Symbol",
    "operator expected",
    e
  );
  invariant(isBinaryOperator(operatorExpr.name), "operator expected", e);
  if(operatorExpr.name === "+") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if(arg.nodeType === "BigInt") {
          if(typeof acc === "bigint") {
            return acc + arg.value;
          }
          if(Number.isInteger(acc)) {
            return BigInt(acc) + arg.value;
          }
          return acc + Number.parseFloat(arg.value.toString());
        }
        if(arg.nodeType === "Number") {
          if(typeof acc === "bigint") {
            return acc + BigInt(arg.value);
          }
          return acc + arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0
    );
    if(typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if(typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  if(operatorExpr.name === "*") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if(arg.nodeType === "BigInt") {
          if(typeof acc === "bigint") {
            return acc * arg.value;
          }
          if(Number.isInteger(acc)) {
            return BigInt(acc) * arg.value;
          }
          return acc * Number.parseFloat(arg.value.toString());
        }
        if(arg.nodeType === "Number") {
          if(typeof acc === "bigint") {
            return acc * BigInt(arg.value);
          }
          return acc * arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0
    );
    if(typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if(typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  if(operatorExpr.name === "-") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if(arg.nodeType === "BigInt") {
          if(typeof acc === "bigint") {
            return acc - arg.value;
          }
          if(Number.isInteger(acc)) {
            return BigInt(acc) - arg.value;
          }
          return acc - Number.parseFloat(arg.value.toString());
        }
        if(arg.nodeType === "Number") {
          if(typeof acc === "bigint") {
            return acc - BigInt(arg.value);
          }
          return acc - arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0
    );
    if(typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if(typeof sum === "number") {
      return {
        nodeType: "Number",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
  }

  if(operatorExpr.name === "/") {
    const sum = e.elements.slice(1).reduce(
      (acc: bigint | number, argExpr: LispExpression): number | bigint => {
        const arg = evaluate(compilerArgs, scope, argExpr);

        if(arg.nodeType === "BigInt") {
          if(typeof acc === "bigint") {
            return acc / arg.value;
          }
          if(Number.isInteger(acc)) {
            return BigInt(acc) / arg.value;
          }
          return acc / Number.parseFloat(arg.value.toString());
        }
        if(arg.nodeType === "Number") {
          if(typeof acc === "bigint") {
            return acc / BigInt(arg.value);
          }
          return acc / arg.value;
        }
        invariant(false, "Expected number", argExpr);
      },
      0
    );
    if(typeof sum === "bigint") {
      return {
        nodeType: "BigInt",
        start: e.start,
        end: e.end,
        value: sum,
      };
    }
    if(typeof sum === "number") {
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
