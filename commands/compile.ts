import { compile as compileStep } from "../compile/mod.ts";
import { colors } from "../deps.ts";
import { getLexems } from "../getLexems/getLexems.ts";
import { LexicalError } from "../getLexems/LexicalError.ts";
import { getLocatedCharsIterator } from "../getLocatedCharsIterator.ts";
import { ICompilerArgs } from "../ICompilerArgs.ts";
import { renderNode } from "../js-ast/renderNode.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { parseExpressions } from "../parseExpressions/parseExpressions.ts";

export async function compile(
  compilerArgs: ICompilerArgs,
): Promise<void> {
  const { entrypointFilePath } = compilerArgs;
  const character$ = await getLocatedCharsIterator(entrypointFilePath);

  const lexem$ = getLexems(character$);

  const expression$ = parseExpressions(lexem$);

  const bundleFile$ = compileStep(expression$);

  const consoleColumns = Deno.consoleSize(Deno.stdout.rid).columns;

  try {
    for (const file of bundleFile$) {
      console.log();
      console.log(colors.green("// " + ("-".repeat(consoleColumns - 3))));
      console.log(colors.green(`/** file: ${file.relativePath} */`));
      console.log(await renderNode(file.ast));
    }
  } catch (error) {
    if (error instanceof LexicalError) {
      error.log();
      if (compilerArgs.showStack) {
        console.log(colors.blue("Stack:"));
        console.log(error.stack);
      }
    } else if (error instanceof LispSyntaxError) {
      error.log();
      if (compilerArgs.showStack) {
        console.log(colors.blue("Stack:"));
        console.log(error.stack);
      }
    } else {
      console.error(error.message);
      console.error(error.stack);
    }
  }
}
