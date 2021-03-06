import { assert } from "../assert.ts";
import { ISymbol } from "../ast.ts";
import { swcType } from "../deps.ts";
import { SPAN } from "./constants.ts";
import { symbolToId } from "./symbolToIdentifier.ts";

function isValidJsId(str: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(str);
}
export function createIdentifier(value: string): swcType.Identifier {
  assert(isValidJsId(value), `invalid identifier: ${value}`);
  return {
    type: "Identifier",
    span: SPAN,
    optional: false,
    value,
  };
}

export function createSymbolIdentifier(symbol: ISymbol): swcType.Identifier {
  return createIdentifier(symbolToId(symbol.name));
}
