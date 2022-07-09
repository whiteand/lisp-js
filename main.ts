import { colors } from "./deps.ts";
import { getLexems } from "./getLexems/getLexems.ts";
import { LexicalError } from "./getLexems/LexicalError.ts";
import { parseArguments } from "./parseArguments.ts";
import { LispSyntaxError } from "./parseExpressions/LispSyntaxError.ts";
import { parseExpressions } from "./parseExpressions/parseExpressions.ts";
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

try {
  for (const expression of expression$) {
    console.log(expression);
  }
} catch (error) {
  if (error && error instanceof LexicalError) {
    error.log();
  } else if (error && error instanceof LispSyntaxError) {
    error.log();
  } else {
    console.log(colors.red(error.message));
    console.error(error.stack);
  }
}

while (true) {
  try {
    const { value, done } = expression$.next();
    if (done) {
      break;
    }
    console.log(value);
  } catch (error) {
  }
}
