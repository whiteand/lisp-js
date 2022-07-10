import { DEFAULT_FUNCTION_NAME, SPAN } from "./constants.ts";
import { ICompilerState } from "./types.ts";
import { getNodeByType } from "../js-ast/traverse.ts";
import { assert } from "../assert.ts";

export function injectDefaultExportMain(state: ICompilerState, filePath: string): void {
  const file = state.files[filePath];
  const module = file.ast;
  const scope = file.scope;

  const defaultExport = getNodeByType("ExportDefaultDeclaration", module);
  assert(!defaultExport, "default export already exists");

  module.body.push({
    type: "ExportDefaultDeclaration",
    span: SPAN,
    decl: {
      type: "FunctionExpression",
      span: SPAN,
      generator: false,
      async: false,
      body: {
        type: "BlockStatement",
        span: SPAN,
        stmts: [],
      },
      identifier: {
        type: "Identifier",
        optional: false,
        span: SPAN,
        value: DEFAULT_FUNCTION_NAME,
      },
      params: [],
    },
  });
  scope.forceDefine(DEFAULT_FUNCTION_NAME, {
    definitionType: "DefaultFunctionName",
  });
}
