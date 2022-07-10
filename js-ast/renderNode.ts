import { swc } from "../deps.ts";
import { Program } from "./swc.ts";

/**
 * @param ast
 * @returns
 */
export async function renderNode(
  ast: Program,
): Promise<string> {
  const res = await swc.print(ast, {
    minify: false,
  });
  return res.code || ''
}
