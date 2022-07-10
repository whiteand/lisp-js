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
  };
  for (const arg of Deno.args.slice(1)) {
    if (arg === "--colors") {
      args.colors = true;
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
    --colors  enables colors in the output (default: false).
              Applicable only for "run" command
  `);
}
