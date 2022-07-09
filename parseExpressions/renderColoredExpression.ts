import { LispExpression } from "../ast.ts";
import { colors } from "../deps.ts";

export function renderColoredExpression(expr: LispExpression): string {
  if (expr.nodeType === "Number") {
    return `${colors.brightGreen(expr.value.toString())}`;
  }

  if (expr.nodeType === "FunctionCall") {
    return `${colors.yellow("(")}${renderColoredExpression(expr.function)} ${
      expr.arguments.map(renderColoredExpression).join(" ")
    }${
      colors.yellow(
        ")",
      )
    }`;
  }
  if (expr.nodeType === "Symbol") {
    return `${colors.cyan(expr.name)}`;
  }
  if (expr.nodeType === "Vector") {
    return `${colors.magenta("[")}${
      expr.elements.map(renderColoredExpression).join(" ")
    }${colors.magenta("]")}`;
  }

  throw new Error("not handled expression: " + JSON.stringify(expr));
}
