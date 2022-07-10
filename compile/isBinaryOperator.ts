import { Values } from "../Values.ts";

const BINARY_OPERATORS_ARR = [
  "*",
  "+",
  "-",
  "/",
  "%",
  "**",
] as const;

type BinaryOperatorString = Values<typeof BINARY_OPERATORS_ARR>;

const BINARY_OPERATORS = new Set<string>(BINARY_OPERATORS_ARR);
export function isBinaryOperator(
  name: string,
): name is BinaryOperatorString {
  return BINARY_OPERATORS.has(name);
}
