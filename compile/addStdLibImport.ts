import { ISymbol } from "../ast.ts";
import { ImportDeclaration, ImportSpecifier } from "../js-ast/swc.ts";
import { querySelector } from "../js-ast/traverse.ts";
import {
  SPAN,
  STD_LIB_FILE,
  STD_LIB_FILE_WITHOUT_EXTENSION,
} from "./constants.ts";
import { ICompilerState } from "./types.ts";

export function addStdLibImport(
  state: ICompilerState,
  nameExpr: ISymbol,
): void {
  const stdLibImportDeclaration = querySelector<ImportDeclaration>(
    (node): node is ImportDeclaration =>
      node.type === "ImportDeclaration" && node.source.value === STD_LIB_FILE,
    state.indexJs.ast,
  );
  const newImportSpecifier: ImportSpecifier = {
    span: SPAN,
    type: "ImportSpecifier",
    imported: null,
    local: {
      type: "Identifier",
      optional: false,
      span: SPAN,
      value: nameExpr.name,
    },
  };
  if (stdLibImportDeclaration) {
    stdLibImportDeclaration.specifiers.push(newImportSpecifier);
    state.indexJs.scope.define(nameExpr.name, {
      definitionType: "import_from_std",
    });
    return;
  }
  state.indexJs.ast.body.unshift({
    type: "ImportDeclaration",
    source: {
      type: "StringLiteral",
      hasEscape: false,
      span: SPAN,
      value: STD_LIB_FILE_WITHOUT_EXTENSION,
    },
    span: SPAN,
    specifiers: [newImportSpecifier],
  });
  state.indexJs.scope.define(nameExpr.name, {
    definitionType: "import_from_std",
  });
}
