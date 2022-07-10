import { LispExpression } from "../ast.ts";
import { VOID } from "./VOID.ts";
import { SourceLocation } from "../SourceLocation.ts";

// deno-lint-ignore no-explicit-any
export function fromJs(value: any): LispExpression {
  if(value == null)
    return VOID;
  if(typeof value === "number") {
    return {
      nodeType: "Number",
      start: new SourceLocation("interpreter", 1, 1),
      end: new SourceLocation("interpreter", 1, 1),
      value,
    };
  }
  if(typeof value === "bigint") {
    return {
      nodeType: "BigInt",
      start: new SourceLocation("interpreter", 1, 1),
      end: new SourceLocation("interpreter", 1, 1),
      value,
    };
  }
  throw new Error(`Cannot transform from js: ${JSON.stringify(value)}`);
}
