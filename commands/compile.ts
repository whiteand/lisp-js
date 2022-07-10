import { compile as compileStep } from "../compile/mod.ts";
import { ColorsContext } from "../contexts/colors.ts";
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
  const resetColorsContext = ColorsContext.provide(
    compilerArgs.colors ? actualColors : noColors,
  );

  const { entrypointFilePath } = compilerArgs;
  const character$ = await getLocatedCharsIterator(entrypointFilePath);

  const lexem$ = getLexems(character$);

  const expression$ = parseExpressions(lexem$);

  const bundleFile$ = compileStep(expression$);

  const consoleColumns = Deno.consoleSize(Deno.stdout.rid).columns;

  const colors = compilerArgs.colors ? actualColors : noColors;

  try {
    for (const file of bundleFile$) {
      console.log();
      console.log(colors.green("// " + ("-".repeat(consoleColumns - 3))));
      console.log(colors.green(`/** file: ${file.relativePath} */`));
      console.log(await renderNode(file.ast));
    }
  } catch (error) {
    printCompilerError(compilerArgs, error, colors);
  } finally {
    resetColorsContext();
  }
}
