import { ISymbol } from "../ast.ts";
import { getNodeByType } from "../js-ast/traverse.ts";
import { invariant } from "../syntaxInvariant.ts";
import { appendImportStdDeclaration } from "./appendImportStdDeclaration.ts";
import { SPAN } from "./constants.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { symbolToId } from "./symbolToIdentifier.ts";
import { ICompilerState } from "./types.ts";

export function appendStdLibFunctionDeclaration(
  state: ICompilerState,
  filePath: string,
  functionNameSymbol: ISymbol,
): void {
  const file = state.files[filePath];
  const program = getNodeByType("Module", file.ast);
  invariant(
    program,
    "cannot find program node in std lib file",
    functionNameSymbol,
  );

  const importDeclaration = appendImportStdDeclaration(program);

  importDeclaration.specifiers.push({
    type: "ImportSpecifier",
    span: SPAN,
    imported: null,
    local: createIdentifier(symbolToId(functionNameSymbol.name)),
  });

  file.scope.define(functionNameSymbol.name, {
    definitionType: "imported_std_function",
  }, functionNameSymbol);
}
