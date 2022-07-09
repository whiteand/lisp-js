import { colors } from "../deps.ts";
import { renderColoredExpression } from "./renderColoredExpression.ts";
import { TParseStackItem } from "./TParseStackItem.ts";

function renderColoredStackItem(stackItem: TParseStackItem): string {
  if (stackItem.stackType === "expression") {
    return `${colors.yellow("expression")}: ${
      renderColoredExpression(stackItem.expression)
    }`;
  }
  if (stackItem.stackType === "expression_list") {
    return `${colors.yellow("expression list")}: ${
      renderColoredExpression({
        nodeType: "Vector",
        elements: stackItem.expressionList,
      })
    }`;
  }
  throw new Error("Not handled stack type: " + (stackItem as any).stackType);
}

export function logStackItem(stackItem: TParseStackItem): void {
  console.log(renderColoredStackItem(stackItem));
}
