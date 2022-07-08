import { ILocatedChar } from "./ILocatedChar.ts";
import { IteratorWithHistory, withHistory } from "./withHistory.ts";
import { withPosition } from "./withPosition.ts";

export async function getFileLocatedChars(
  entryPointFilePath: string,
): Promise<IteratorWithHistory<ILocatedChar>> {
  const entryPointFileContent = await Deno.readTextFile(entryPointFilePath);

  const historyFileIterator = withHistory(withPosition(
    entryPointFilePath,
    entryPointFileContent[Symbol.iterator](),
  ));
  return historyFileIterator;
}
