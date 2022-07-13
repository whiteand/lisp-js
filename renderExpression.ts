import { LispExpression } from "./ast.ts";
import { isSpecialSymbol } from "./compile/isSpecialSymbol.ts";
import { ColorsContext } from "./contexts/colors.ts";

export function renderExpression(expr: LispExpression): string {
  const colors = ColorsContext.getValue();
  if (expr.nodeType === "Number") {
    return `${colors.brightGreen(expr.value.toString())}`;
  }

  if (expr.nodeType === "List") {
    return `${colors.yellow("(")}${
      expr.elements.map(renderExpression).join(" ")
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
    if (isSpecialSymbol(expr.name)) {
      return colors.blue(expr.name);
    }
    return `${colors.white(expr.name)}`;
  }
  if (expr.nodeType === "String") {
    return colors.rgb24(`"${expr.value}"`, 0xce9178);
  }
  if (expr.nodeType === "Vector") {
    return `${colors.magenta("[")}${
      expr.elements.map(renderExpression).join(" ")
    }${colors.magenta("]")}`;
  }

  throw new Error("not handled expression: " + JSON.stringify(expr));
}
