import { ICompilerArgs } from "./ICompilerArgs.ts";

export async function parseArguments(): Promise<
  ICompilerArgs
> {
  const command = Deno.args[0];
  if (command !== "run" && command !== "compile") {
    logHelp();
    Deno.exit(6);
  }
  const args: ICompilerArgs = {
    command,
    entrypointFilePath: "",
    colors: false,
    stdLibPath: "",
    showStack: false,
    measurePerformance: false,
  };
  let i = 1;
  while (i < Deno.args.length) {
    const arg = Deno.args[i++];
    if (arg === "--colors") {
      args.colors = true;
      continue;
    }
    if (arg === "--measure-performance") {
      args.measurePerformance = true;
      continue;
    }
    if (arg === "--show-stack") {
      args.showStack = true;
      continue;
    }
    if (arg === "--help") {
      logHelp();
      continue;
    }
    if (arg === "--std") {
      args.stdLibPath = Deno.args[i++];
    }
    args.entrypointFilePath = arg;
  }
  if (!args.stdLibPath || !(await fileExists(args.stdLibPath))) {
    console.log("std lib was not provided via --std parameter");
    console.log(`passed arg: "${args.stdLibPath}"`);
    Deno.exit(1);
  }
  if (!args.entrypointFilePath) {
    console.log("entry point is not provided");
    logHelp();
    Deno.exit(7);
  }
  const entrypointExists = await fileExists(args.entrypointFilePath);
  if (!entrypointExists) {
    console.log(`entry point file ${args.entrypointFilePath} does not exist`);
    Deno.exit(8);
  }
  return args;
}

function fileExists(filePath: string): Promise<boolean> {
  return Deno.stat(filePath).then(() => true, () => false);
}

function logHelp() {
  console.log(`
USAGE:
  ljs run [OPTIONS] [entrypoint.ljs]
  ljs compile [OPTIONS] [entrypoint.ljs]
OPTIONS:
  --colors
      Enables colors in the output (default: false).
  --showStack 
      Shows stack trace of lexical and syntax errors
  --measure-performance
      Shows how long it takes for each step of the execution
  --help
      Renders this help message
  `.trim());
}
