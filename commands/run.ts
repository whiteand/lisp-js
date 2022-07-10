import { ColorsContext } from "../contexts/colors.ts";
import { ACTUAL_TIMER, NO_TIMER, TimerContext } from "../contexts/timer.ts";
import { colors as actualColors } from "../deps.ts";
import { getLexems } from "../getLexems/getLexems.ts";
import { getLocatedCharsIterator } from "../getLocatedCharsIterator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { interpret } from "../interpreter/interpret.ts";
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

  try {
    const timer = TimerContext.getValue();
    timer.reset();
    interpret(compilerArgs, expression$);
    timer.finished("interpretation");
  } catch (error) {
    printCompilerError(compilerArgs, error);
  } finally {
    cleanup();
  }
}
