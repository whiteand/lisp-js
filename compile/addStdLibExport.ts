import { ISymbol } from "../ast.ts";
import { ExportDeclaration } from "../js-ast/swc.ts";
import { getNodeByType, querySelector } from "../js-ast/traverse.ts";
import { invariant } from "../syntaxInvariant.ts";
import { ICompilerState } from "./types.ts";

export function addStdLibExport(
  state: ICompilerState,
  nameSymbol: ISymbol,
): void {
  const program = getNodeByType("Module", state.stdLib.ast);
  invariant(program, "cannot find program node in std lib file", nameSymbol);

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
    state.fullStdLibAst,
  );
  invariant(
    exportDeclaration,
    "There is no such standard library function",
    nameSymbol,
  );
  program.body.push(exportDeclaration);
  state.stdLib.scope.define(nameSymbol.name, {
    definitionType: "stdlib_export",
  }, nameSymbol);
}
