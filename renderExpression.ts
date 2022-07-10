import { LispExpression } from "./ast.ts";
import { colors } from "./deps.ts";

export function renderColoredExpression(expr: LispExpression): string {
  if (expr.nodeType === "Number") {
    return `${colors.brightGreen(expr.value.toString())}`;
  }

  if (expr.nodeType === "List") {
    return `${colors.yellow("(")}${
      expr.elements.map(renderColoredExpression).join(" ")
    }${
      colors.yellow(
        ")",
      )
    }`;
  }
  if (expr.nodeType === "Void") {
    return colors.gray("void");
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
export function renderExpression(expr: LispExpression): string {
  if (expr.nodeType === "Number") {
    return expr.value.toString();
  }

  if (expr.nodeType === "List") {
    return `(${expr.elements.map(renderExpression).join(" ")})`;
  }
  if (expr.nodeType === "Void") {
    return 'void'
  }
  if (expr.nodeType === "Symbol") {
    return expr.name
  }
  if (expr.nodeType === "Vector") {
    return `[${expr.elements.map(renderExpression).join(" ")}]`;
  }

  throw new Error("not handled expression: " + JSON.stringify(expr));
}
