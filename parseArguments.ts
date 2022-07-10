export async function parseArguments(): Promise<
  { entryPointFilePath: string; command: "run" | "compile" }
> {
  const command = Deno.args[0];
  if (command !== "run" && command !== "compile") {
    logHelp();
    Deno.exit(6)
  }
  const entryPointFilePath = Deno.args[1];
  if (typeof entryPointFilePath !== "string") {
    console.error("entrypoint is not passed");
    Deno.exit(4);
  }
  try {
    await Deno.stat(entryPointFilePath);
    return { entryPointFilePath, command };
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
