import { compile as compileStep } from "../compile/compile.ts";
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
  try {
    const character$ = await getLocatedCharsIterator(entrypointFilePath);
    timer.finished("character$ created");

    const lexem$ = getLexems(character$);
    timer.finished("lexem$ created");

    const expression$ = parseExpressions(lexem$);
    timer.finished("expression$ created");

    const bundleFile$ = await compileStep(expression$);

    const bundleFiles = [...bundleFile$];
    timer.finished("bundleFile$ created");
    Deno.mkdir("./dist", { recursive: true });
    for (const bundleFile of bundleFiles) {
      const code = await slowRenderNode(bundleFile.ast);
      printBundleFilesToConsole(bundleFile.relativePath, code);
      saveBundleFilesToHarddrive(bundleFile.relativePath, code);
    }
  } catch (error) {
    printCompilerError(compilerArgs, error);
  } finally {
    cleanup();
  }
}

function printBundleFilesToConsole(relativePath: string, code: string) {
  const colors = ColorsContext.getValue();
  console.log(colors.green(relativePath));
  console.log(code);
}

function saveBundleFilesToHarddrive(
  relativePath: string,
  code: string,
) {
  return Deno.writeTextFile(`./dist/${relativePath}`, code);
}
