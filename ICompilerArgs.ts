export interface ICompilerArgs {
  entrypointFilePath: string;
  command: "run" | "compile";
  colors: boolean;
}
