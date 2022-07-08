import { ILocatedChar } from "./ICharWithPosition.ts";
import { IteratorWithHistory, withHistory } from "./withHistory.ts";
import { withPosition } from "./withPosition.ts";

export async function getSourceCharacterIterator(entryPointFilePath: string): Promise<IteratorWithHistory<ILocatedChar>> {
  const entryPointFileContent = await Deno.readTextFile(entryPointFilePath);

  const fileIterator = entryPointFileContent[Symbol.iterator]();

  const charIteratorWithPosition = withPosition(
    entryPointFilePath,
    fileIterator
  );

  const historyFileIterator = withHistory(charIteratorWithPosition);
  return historyFileIterator;
}
