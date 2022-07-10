import { LispExpression } from "./ast.ts";
import { ColorsContext } from "./contexts/colors.ts";

export function renderColoredExpression(expr: LispExpression): string {
  const colors = ColorsContext.getValue();
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
