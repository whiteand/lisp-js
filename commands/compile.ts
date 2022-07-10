import { compile as compileStep } from "../compile/compile.ts";
import { ColorsContext } from "../contexts/colors.ts";
import { ACTUAL_TIMER, NO_TIMER, TimerContext } from "../contexts/timer.ts";
import { colors as actualColors } from "../deps.ts";
import { getLexems } from "../getLexems/getLexems.ts";
import { getLocatedCharsIterator } from "../getLocatedCharsIterator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { renderNode } from "../js-ast/renderNode.ts";
import { noColors } from "../noColors.ts";
import { parseExpressions } from "../parseExpressions/parseExpressions.ts";
import { printCompilerError } from "./printCompilerError.ts";

export async function compile(
  compilerArgs: ICompilerArgs,
): Promise<void> {
  const resetTimerContext = TimerContext.provide(
    compilerArgs.measurePerformance ? ACTUAL_TIMER : NO_TIMER,
  );
  const resetColorsContext = ColorsContext.provide(
    compilerArgs.colors ? actualColors : noColors,
  );

  function cleanup() {
    resetTimerContext();
    resetColorsContext();
  }

  const timer = TimerContext.getValue();
  timer.reset();
  const { entrypointFilePath } = compilerArgs;
  timer.finished("initialization");
  const character$ = await getLocatedCharsIterator(entrypointFilePath);
  timer.finished("character$ created");

  const lexem$ = getLexems(character$);
  timer.finished("lexem$ created");

  const expression$ = parseExpressions(lexem$);
  timer.finished("expression$ created");

  const bundleFile$ = await compileStep(expression$);
  timer.finished("bundleFile$ created");

  try {
    const bundleFiles = [...bundleFile$];
    Deno.mkdir("./dist", { recursive: true });
    await Promise.all(
      bundleFiles.map((file) =>
        renderNode(file.ast).then((code) =>
          Deno.writeTextFile(`./dist/${file.relativePath}`, code)
        )
      ),
    );
  } catch (error) {
    printCompilerError(compilerArgs, error);
  } finally {
    cleanup();
  }
}
