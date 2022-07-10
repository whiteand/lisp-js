import { assert } from "../assert.ts";
import { ISymbol } from "../ast.ts";
import { ExportDeclaration, Module } from "../js-ast/swc.ts";
import { getNodeByType, querySelector } from "../js-ast/traverse.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { IBundleFileState } from "./types.ts";

export function addStdLibExport(
  fullStdLibAst: Module,
  stdLibFile: IBundleFileState,
  nameSymbol: ISymbol,
): void {
  const program = getNodeByType("Module", stdLibFile.ast);
  assert(program, "cannot find program node in std lib file");

  const exportDeclaration = querySelector<ExportDeclaration>(
    (node): node is ExportDeclaration => {
      if (node.type !== "ExportDeclaration") {
        return false;
      }
      if (node.declaration.type !== "FunctionDeclaration") {
        return false;
      }
      if (node.declaration.identifier.value !== nameSymbol.name) {
        return false;
      }
      return true;
    },
    fullStdLibAst,
  );
  if (!exportDeclaration) {
    throw LispSyntaxError.fromExpression(
      "There is no such standard library function",
      nameSymbol,
    );
  }
  stdLibFile.exportedSymbols.add(nameSymbol.name);
  program.body.push(exportDeclaration);
}
