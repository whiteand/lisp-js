import { LispExpression } from "../ast.ts";
import { swc } from "../deps.ts";
import { Module } from "../js-ast/swc.ts";
import { compileStatement } from "./compileStatement.ts";
import { invariant } from "../syntaxInvariant.ts";
import { SPAN, STD_LIB_FILE } from "./constants.ts";
import { Scope } from "../Scope.ts";
import { STD } from "./std-code.ts";
import { IBundleFile, ICompilerState } from "./types.ts";

export function* compile(
  expression$: Iterable<LispExpression>,
): Generator<IBundleFile, void, unknown> {
  const fullStdLibAst = swc.parse(STD, { syntax: "ecmascript" }) as Module;

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
    invariant(
      expr.nodeType !== "BigInt",
      "This statement cannot be global",
      expr,
    );
    invariant(
      expr.nodeType !== "Number",
      "This statement cannot be global",
      expr,
    );
    invariant(
      expr.nodeType !== "Symbol",
      "This statement cannot be global",
      expr,
    );
    invariant(
      expr.nodeType !== "Vector",
      "This statement cannot be global",
      expr,
    );
    if (expr.nodeType === "List") {
      compileStatement(state, expr);
      continue;
    }
    invariant(false, "Unsupported expression", expr);
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
