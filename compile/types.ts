import { swcType } from "../deps.ts";
import { IScope } from "../Scope.ts";

export type StdLibFunctionName = "log";

export interface IBundleFile {
  relativePath: string;
  ast: swcType.Module;
}

export interface IBundleFileState {
  ast: swcType.Module;
  scope: IScope;
}

export interface ICompilerState {
  files: Record<string, IBundleFileState>;
  fullStdLibAst: swcType.Module;
}
