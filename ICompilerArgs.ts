export interface ICompilerArgs {
  entrypointFilePath: string;
  command: "run" | "compile";
  showStack: boolean
  colors: boolean;
}
