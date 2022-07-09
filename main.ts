import { getLexems } from "./getLexems/getLexems.ts";
import { parseArguments } from "./parseArguments.ts";
import { parseExpressions } from "./parseExpressions/parseExpressions.ts";
import { renderColoredExpression } from "./renderColoredExpression.ts";
import { SourceCharIterator } from "./SourceCharIterator.ts";

const { entryPointFilePath } = await parseArguments();

const entryPointFileContent = await Deno.readTextFile(entryPointFilePath);

const character$ = new SourceCharIterator(
  entryPointFilePath,
  entryPointFileContent,
  0,
);
const lexem$ = getLexems(character$);

const expression$ = parseExpressions(lexem$);

for (const expression of expression$) {
  console.log(renderColoredExpression(expression));
}
