export interface ICompilerArgs {
  entrypointFilePath: string;
  stdLibPath: string
  
  command: "run" | "compile";
  showStack: boolean;
  colors: boolean;
  measurePerformance: boolean;
}
