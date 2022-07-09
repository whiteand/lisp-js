import { IMultilineComment } from "./jsAst.ts";

export function multilineDocCommentNode(content: string): IMultilineComment {
  return { type: "MultilineDocComment", content };
}
