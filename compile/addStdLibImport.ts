import { ImportDeclaration, ImportSpecifier } from "../js-ast/swc.ts";
import { querySelector } from "../js-ast/traverse.ts";
import { IBundleFileState } from "./types.ts";
import {
  SPAN,
  STD_LIB_FILE,
  STD_LIB_FILE_WITHOUT_EXTENSION,
} from "./constants.ts";

export function addStdLibImport(
  indexJsFile: IBundleFileState,
  name: string,
): void {
  const stdLibImportDeclaration = querySelector<ImportDeclaration>(
    (node): node is ImportDeclaration =>
      node.type === "ImportDeclaration" && node.source.value === STD_LIB_FILE,
    indexJsFile.ast,
  );
  const newImportSpecifier: ImportSpecifier = {
    span: SPAN,
    type: "ImportSpecifier",
    imported: null,
    local: {
      type: "Identifier",
      optional: false,
      span: SPAN,
      value: name,
    },
  };
  if (stdLibImportDeclaration) {
    stdLibImportDeclaration.specifiers.push(newImportSpecifier);
    indexJsFile.importedSymbols.add(name);
    return;
  }
  indexJsFile.ast.body.unshift({
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
  indexJsFile.importedSymbols.add(name);
}
