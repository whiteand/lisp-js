import { LispExpression } from "../ast.ts";
import { Scope } from "../Scope.ts";
import { invariant } from "../syntaxInvariant.ts";
import { BlockStatementList } from "./BlockStatementList.ts";
import { compileStatement } from "./compileStatement.ts";
import { OUT_ENTRYPOINT_PATH, SPAN } from "./constants.ts";
import { injectDefaultExportMain } from "./injectDefaultExportMain.ts";
import { IBundleFile, ICompilerState } from "./types.ts";

export function compile(
  expression$: Iterable<LispExpression>,
): Promise<IBundleFile[]> {
  const state: ICompilerState = {
    files: {
      [OUT_ENTRYPOINT_PATH]: {
        ast: {
          type: "Module",
          span: SPAN,
          interpreter: null as any,
          body: [],
        },
        scope: new Scope(null),
      },
    },
  };

  const blockStatement = injectDefaultExportMain(state, OUT_ENTRYPOINT_PATH);
  const activeScope = state.files[OUT_ENTRYPOINT_PATH].scope;
  const blockStatementList = new BlockStatementList(
    activeScope,
    blockStatement,
  );

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
      compileStatement(state, blockStatementList, expr);
      continue;
    }
    invariant(false, "Unsupported expression", expr);
  }

  blockStatementList.close();

  return Promise.resolve([{
    relativePath: "index.js",
    ast: state.files[OUT_ENTRYPOINT_PATH].ast,
  }]);
}
