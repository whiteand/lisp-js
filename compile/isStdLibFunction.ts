import { StdLibFunctionName } from "./types.ts";

export function isStdLibFunction(name: string): name is StdLibFunctionName {
  return name === "log" || name === "get" || name === "panic";
}
