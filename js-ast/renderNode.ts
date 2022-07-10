import { Program } from "./swc.ts";
import { swc } from "../deps.ts";

/**
 * @param ast
 * @returns
 */
export function renderNode(
  ast: Program,
): Promise<string> {
  const res = swc.print(ast, {
    minify: false,
  });
  return Promise.resolve(res.code || "")
}
