import { compile } from "./commands/compile.ts";
import { run } from "./commands/run.ts";
import { parseArguments } from "./parseArguments.ts";


const args = await parseArguments();
const { command } = args;

if (command === "compile") {
  console.log('compilation started...')
  await compile(args);
} else if (command === "run") {
  await run(args);
} else {
  console.log("Unkonwn command");
}
