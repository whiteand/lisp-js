import { LispExpression } from "../ast.ts";
import { Scope } from "../Scope.ts";
import { BlockStatementList } from "./BlockStatementList.ts";
import { compileStatements } from "./compileStatements.ts";
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

  compileStatements(state, blockStatementList, expression$);

  blockStatementList.close();

  return Promise.resolve([{
    relativePath: "index.js",
    ast: state.files[OUT_ENTRYPOINT_PATH].ast,
  }]);
}
