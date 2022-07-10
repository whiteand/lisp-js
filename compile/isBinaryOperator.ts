const BINARY_OPERATORS = new Set([
  "*",
  "+",
  "-",
  "/",
  "%",
  "**",
]);
export function isBinaryOperator(
  name: string,
): name is "+" | "*" | "**" | "-" | "/" | "<" | ">" | "<=" | ">=" {
  return BINARY_OPERATORS.has(name)
}
