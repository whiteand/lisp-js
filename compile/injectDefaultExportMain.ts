import { assert } from "../assert.ts";
import { swcType } from "../deps.ts";
import { getNodeByType } from "../js-ast/traverse.ts";
import { DEFAULT_FUNCTION_NAME, SPAN } from "./constants.ts";
import { createBlock } from "./createBlock.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { ICompilerState } from "./types.ts";

export function injectDefaultExportMain(
  state: ICompilerState,
  filePath: string,
): swcType.BlockStatement {
  const file = state.files[filePath];
  const module = file.ast;
  const scope = file.scope;

  const defaultExport = getNodeByType("ExportDefaultDeclaration", module);
  assert(!defaultExport, "default export already exists");

  const mainFunctionBlockStatement: swcType.BlockStatement = createBlock();

  module.body.push({
    type: "ExportDefaultDeclaration",
    span: SPAN,
    decl: {
      type: "FunctionExpression",
      span: SPAN,
      generator: false,
      async: false,
      body: mainFunctionBlockStatement,
      identifier: createIdentifier(DEFAULT_FUNCTION_NAME),
      params: [],
    },
  });
  scope.forceDefine(DEFAULT_FUNCTION_NAME, {
    definitionType: "DefaultFunctionName",
  });
  return mainFunctionBlockStatement;
}
