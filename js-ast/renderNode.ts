import { Program } from "./swc.ts";
import { print } from "https://deno.land/x/swc@0.2.0/mod.ts";

/**
 * @param ast
 * @returns
 */
export function renderNode(
  ast: Program,
): string {
  const res = print(ast, {
    minify: false,
  });
  return res.code || "";
}
