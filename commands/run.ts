import { compile } from "../compile/compile.ts";
import { ColorsContext } from "../contexts/colors.ts";
import { ACTUAL_TIMER, NO_TIMER, TimerContext } from "../contexts/timer.ts";
import { colors as actualColors } from "../deps.ts";
import { getLexems } from "../getLexems/getLexems.ts";
import { getLocatedCharsIterator } from "../getLocatedCharsIterator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { slowRenderNode } from "../js-ast/slowRenderNode.ts";
import { noColors } from "../noColors.ts";
import { parseExpressions } from "../parseExpressions/parseExpressions.ts";
import { printCompilerError } from "./printCompilerError.ts";

export async function run(compilerArgs: ICompilerArgs): Promise<void> {
  const resetColorsContext = ColorsContext.provide(
    compilerArgs.colors ? actualColors : noColors,
  );
  const resetTimerContext = TimerContext.provide(
    compilerArgs.measurePerformance ? ACTUAL_TIMER : NO_TIMER,
  );
  function cleanup() {
    resetColorsContext();
    resetTimerContext();
  }

  const character$ = await getLocatedCharsIterator(
    compilerArgs.entrypointFilePath,
  );

  const lexem$ = getLexems(character$);

  const expression$ = parseExpressions(lexem$);

  const bundleFiles = await compile(expression$);

  const tempDirPath = await Deno.makeTempDir({
    dir: ".",
    prefix: "ljs_run",
  });

  try {
    for (const file of bundleFiles) {
      const code = await slowRenderNode(file.ast);
      await Deno.writeTextFile(`${tempDirPath}/${file.relativePath}`, code);
    }
    Deno.copyFile(compilerArgs.stdLibPath, `${tempDirPath}/std.js`);
    Deno.writeTextFile(
      `${tempDirPath}/mod.js`,
      `
import program from './${bundleFiles[0].relativePath}';
program()
    `.trim(),
    );
    const res = Deno.run({
      cmd: [Deno.execPath(), "run", "-A", `${tempDirPath}/mod.js`],
    });
    res.stdout?.readable.pipeTo(Deno.stdout.writable);
    res.stderr?.readable.pipeTo(Deno.stderr.writable);
  } catch (error) {
    printCompilerError(compilerArgs, error);
  } finally {
    cleanup();
  }
}
