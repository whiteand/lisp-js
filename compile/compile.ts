import { LispExpression } from "../ast.ts";
import { swc } from "../deps.ts";
import { Module } from "../js-ast/swc.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { compileGlobalFunctionCall } from "./compileGlobalFunctionCall.ts";
import { FULL_STD_LIB_PATH, SPAN, STD_LIB_FILE } from "./constants.ts";
import { Scope } from "./Scope.ts";
import { IBundleFile, ICompilerState } from "./types.ts";

export function* compile(
  expression$: Iterable<LispExpression>,
): Generator<IBundleFile, void, unknown> {
  const fullStdLibAst = swc.parse(Deno.readTextFileSync(FULL_STD_LIB_PATH), {
    syntax: "ecmascript",
  }) as Module;

  const state: ICompilerState = {
    fullStdLibAst,
    stdLib: {
      ast: {
        type: "Module",
        interpreter: null,
        span: SPAN,
        body: [],
      },
      scope: new Scope(null),
    },
    indexJs: {
      ast: {
        type: "Module",
        span: SPAN,
        interpreter: null,
        body: [],
      },
      scope: new Scope(null),
    },
  };

  for (const expr of expression$) {
    if (expr.nodeType === "BigInt") {
      throw LispSyntaxError.fromExpression(
        "Only functions can be globally used",
        expr,
      );
    }
    if (expr.nodeType === "Number") {
      throw LispSyntaxError.fromExpression(
        "Only functions can be globally used",
        expr,
      );
    }
    if (expr.nodeType === "Symbol") {
      throw LispSyntaxError.fromExpression(
        "Only functions can be globally used",
        expr,
      );
    }
    if (expr.nodeType === "Vector") {
      throw LispSyntaxError.fromExpression(
        "Only functions can be globally used",
        expr,
      );
    }
    if (expr.nodeType === "List") {
      compileGlobalFunctionCall(state, expr);
      continue;
    }
    throw LispSyntaxError.fromExpression("Unknown expression", expr);
  }

  yield {
    relativePath: STD_LIB_FILE,
    ast: state.stdLib.ast,
  };

  yield {
    relativePath: "index.js",
    ast: state.indexJs.ast,
  };
}
