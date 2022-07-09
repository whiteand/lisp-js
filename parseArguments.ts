export async function parseArguments(): Promise<
  { entryPointFilePath: string }
> {
  const entryPointFilePath = Deno.args[0];
  if (typeof entryPointFilePath !== "string") {
    console.error("entrypoint is not passed");
    Deno.exit(4);
  }
  try {
    await Deno.stat(entryPointFilePath);
    return { entryPointFilePath };
  } catch (error) {
    console.error(error);
    Deno.exit(5);
  }
}
