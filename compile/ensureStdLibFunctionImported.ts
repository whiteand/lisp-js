import { ISymbol } from "../ast.ts";
import { addStdLibExport } from "./addStdLibExport.ts";
import { addStdLibImport } from "./addStdLibImport.ts";
import { ICompilerState, StdLibFunctionName } from "./types.ts";

export function ensureStdLibFunctionImported(
  state: ICompilerState,
  funcNameExpr: ISymbol,
): void {
  if (!state.stdLib.exportedSymbols.has(funcNameExpr.name)) {
    addStdLibExport(state.fullStdLibAst, state.stdLib, funcNameExpr);
  }
  if (!state.indexJs.importedSymbols.has(funcNameExpr.name)) {
    addStdLibImport(state.indexJs, funcNameExpr.name as StdLibFunctionName);
  }
}
