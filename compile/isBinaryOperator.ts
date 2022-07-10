export function isBinaryOperator(name: string): name is "+" | "*" {
  return name === "+" || name === "*";
}
