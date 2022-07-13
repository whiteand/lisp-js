import { swcType } from "../deps.ts";
import { SPAN } from "./constants.ts";

export function createIdentifier(value: string): swcType.Identifier {
  return {
    type: "Identifier",
    span: SPAN,
    optional: false,
    value,
  };
}
