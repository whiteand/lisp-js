import { Module } from "../js-ast/swc.ts";
import { IScope } from "./Scope.ts";

export type StdLibFunctionName = "log";

export interface IBundleFile {
  relativePath: string;
  ast: Module;
}

export interface IBundleFileState {
  ast: Module;
  scope: IScope;
}

export interface ICompilerState {
  stdLib: IBundleFileState;
  indexJs: IBundleFileState;
  fullStdLibAst: Module;
}
