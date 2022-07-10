export async function parseArguments(): Promise<
  { entrypointFilePath: string; command: "run" | "compile" }
> {
  const command = Deno.args[0];
  if (command !== "run" && command !== "compile") {
    logHelp();
    Deno.exit(6)
  }
  const entrypointFilePath = Deno.args[1];
  if (typeof entrypointFilePath !== "string") {
    console.error("entrypoint is not passed");
    Deno.exit(4);
  }
  try {
    await Deno.stat(entrypointFilePath);
    return { entrypointFilePath, command };
  } catch (error) {
    console.error(error);
    Deno.exit(5);
  }
}

function logHelp() {
  console.log(`
  Usage:
    ljs run [entrypoint.ljs]
    ljs compile [entrypoint.ljs]
  `);
}
