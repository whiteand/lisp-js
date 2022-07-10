import { ISymbol, LispExpression } from "../ast.ts";
import { StdLibFunctionName } from "../compile/types.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { renderExpression } from "../renderExpression.ts";
import { IScope } from "../Scope.ts";
import { invariant } from "../syntaxInvariant.ts";
import { VOID } from "./VOID.ts";
import { evaluate } from "./evaluate.ts";
import { toJs } from "./toJs.ts";
import { fromJs } from "./fromJs.ts";

export function stdLibFunctionCall(
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
  if (func.name === "get") {
    if (args.length <= 0) {
      return func;
    }
    if (args.length <= 1) {
      const s = func.start;
      const e = args.at(-1)?.end || s;
      return {
        nodeType: "List",
        start: s,
        end: e,
        elements: [
          {
            nodeType: "Symbol",
            start: s,
            end: e,
            member: false,
            name: "fn",
          },
          {
            nodeType: "Vector",
            elements: [
              {
                nodeType: "Symbol",
                member: false,
                end: e,
                start: s,
                name: "obj",
              },
            ],
            start: s,
            end: e,
          },
          {
            nodeType: "List",
            start: s,
            end: e,
            elements: [
              {
                nodeType: "Symbol",
                end: e,
                start: s,
                member: false,
                name: "get",
              },
              args[0],
              {
                nodeType: "Symbol",
                end: e,
                start: s,
                member: false,
                name: "obj",
              },
            ],
          },
        ],
      };
    }
    invariant(args.length <= 2, "get should take only two arguments", args[2]);
    const prop = evaluate(compilerArgs, scope, args[0]);
    const obj = evaluate(compilerArgs, scope, args[1]);
    invariant(
      prop.nodeType === "String",
      "get should take only strings",
      args[0],
    );
    const objJs = toJs(obj);

    return fromJs(objJs?.[prop.value]);
  }
  invariant(false, "Cannot execute std lib call", func);
}

