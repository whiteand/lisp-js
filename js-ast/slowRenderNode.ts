import { print } from "https://deno.land/x/swc@0.2.1/mod.ts";
import { swcType } from "../deps.ts";

export async function slowRenderNode(node: swcType.Module): Promise<string> {
  return Promise.resolve(print(node)?.code || "");
}
