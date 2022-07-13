import { swcType } from "../deps.ts";
import { SPAN } from "./constants.ts";

export function createBlock(): swcType.BlockStatement {
  return {
    type: "BlockStatement",
    span: SPAN,
    stmts: [],
  };
}
