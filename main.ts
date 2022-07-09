import { getFileLocatedChars } from "./getFileLocatedChars.ts";
import { getLexems } from "./getLexems/getLexems.ts";
import { LexicalError } from "./getLexems/LexicalError.ts";
import { SourceCharIterator } from "./SourceCharIterator.ts";

const entryPointFilePath = Deno.args[0];

const entryPointFileContent = await Deno.readTextFile(entryPointFilePath);

const sourceIterator = new SourceCharIterator(
  entryPointFilePath,
  entryPointFileContent,
  0,
);

const lexemsIterator = getLexems(sourceIterator);

while (true) {
  try {
    const { value, done } = lexemsIterator.next();
    if (done) {
      break;
    }
    console.log(value);
  } catch (error) {
    if (error && error instanceof LexicalError) {
      console.error(error.message);
      Deno.exit(1);
    }
  }
}
