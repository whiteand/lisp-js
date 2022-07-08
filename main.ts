import { getFileLocatedChars } from "./getFileLocatedChars.ts";
import { getLexems } from "./getLexems/getLexems.ts";
import { LexicalError } from "./getLexems/LexicalError.ts";

const entryPointFilePath = Deno.args[0];

const sourceIterator = await getFileLocatedChars(entryPointFilePath);

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
