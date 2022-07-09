import { IBackableIterator } from "./IBackableIterator.ts";
import { ILocatedChar } from "./ILocatedChar.ts";
import { SourceCharIterator } from "./SourceCharIterator.ts";

export async function getLocatedCharsIterator(
  filePath: string,
): Promise<IBackableIterator<ILocatedChar>> {
  const entryPointFileContent = await Deno.readTextFile(filePath);

  return new SourceCharIterator(
    filePath,
    entryPointFileContent,
    0,
  );
}
