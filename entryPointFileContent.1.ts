import { SourceCharIterator } from "./SourceCharIterator.ts";

const entryPointFileContent = await Deno.readTextFile(entryPointFilePath);
export const character$ = new SourceCharIterator(
  entryPointFilePath,
  entryPointFileContent,
  0
);
