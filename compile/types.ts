import { Module } from "../js-ast/swc.ts";

export type StdLibFunctionName = "log";

export interface IBundleFile {
  relativePath: string;
  ast: Module;
}

export interface IBundleFileState {
  ast: Module;
  importedSymbols: Set<string>;
  exportedSymbols: Set<string>;
}

export interface ICompilerState {
  stdLib: IBundleFileState;
  indexJs: IBundleFileState;
  fullStdLibAst: Module;
}
