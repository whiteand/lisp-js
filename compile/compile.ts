import { LispExpression } from "../ast.ts";
import { swc } from "../deps.ts";
import { Module } from "../js-ast/swc.ts";
import { compileStatement } from "./compileStatement.ts";
import { invariant } from "../syntaxInvariant.ts";
import { OUT_ENTRYPOINT_PATH, SPAN } from "./constants.ts";
import { Scope } from "../Scope.ts";
import { STD } from "./std-code.ts";
import { IBundleFile, ICompilerState } from "./types.ts";
import { injectDefaultExportMain } from "./injectDefaultExportMain.ts";

export function* compile(
  expression$: Iterable<LispExpression>,
): Generator<IBundleFile, void, unknown> {
  const fullStdLibAst = swc.parse(STD, { syntax: "ecmascript" }) as Module;

  const state: ICompilerState = {
    files: {
      [OUT_ENTRYPOINT_PATH]: {
        ast: {
          type: "Module",
          span: SPAN,
          interpreter: null,
          body: [],
        },
        scope: new Scope(null),
      },
    },
    fullStdLibAst,
  };

  injectDefaultExportMain(state, OUT_ENTRYPOINT_PATH);

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
    relativePath: "index.js",
    ast: state.files[OUT_ENTRYPOINT_PATH].ast,
  };
}
