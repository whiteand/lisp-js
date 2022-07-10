import { compile } from "./compile/mod.ts";
import { colors } from "./deps.ts";
import { getLexems } from "./getLexems/getLexems.ts";
import { getLocatedCharsIterator } from "./getLocatedCharsIterator.ts";
import { parseArguments } from "./parseArguments.ts";
import { parseExpressions } from "./parseExpressions/parseExpressions.ts";
import { renderNode } from "./js-ast/renderNode.ts";
import { LexicalError } from "./getLexems/LexicalError.ts";
import { LispSyntaxError } from "./LispSyntaxError.ts";

const { entryPointFilePath } = await parseArguments();

const character$ = await getLocatedCharsIterator(entryPointFilePath);

const lexem$ = getLexems(character$);

const expression$ = parseExpressions(lexem$);

const bundleFile$ = compile(expression$);

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
    error.log()
  } else if (error instanceof LispSyntaxError) {
    error.log()
  } else {
    console.error(error.message)
    console.error(error.stack)
  }
}
