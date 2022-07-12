import { print, swcType } from "../deps.ts";

/**
 * @param ast
 * @returns
 */
export async function renderNode(
  ast: swcType.Program,
): Promise<string> {
  const res = await print(ast, {
    minify: false,
  });
  return res.code || "";
}
