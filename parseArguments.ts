import { ICompilerArgs } from "./ICompilerArgs.ts";

export async function parseArguments(): Promise<
  ICompilerArgs
> {
  const command = Deno.args[0];
  if (command !== "run" && command !== "compile") {
    logHelp();
    Deno.exit(6);
  }
  let args: ICompilerArgs = {
    command,
    entrypointFilePath: "",
    colors: false,
    showStack: false,
  };
  for (const arg of Deno.args.slice(1)) {
    if (arg === "--colors") {
      args.colors = true;
      continue
    }
    if (arg === "--show-stack") {
      args.showStack = true;
      continue
    }
    if (arg === "--help") {
      logHelp();
      continue
    }
    args.entrypointFilePath = arg;
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
  Usage:
    ljs run [entrypoint.ljs]
    ljs compile [entrypoint.ljs]
  options:
    --colors
        Enables colors in the output (default: false).
        Applicable only for "run" command

    --showStack 
        Shows stack trace of lexical and syntax errors
        For now applicable only for "compile" command
  `);
}
