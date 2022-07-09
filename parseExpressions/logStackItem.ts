import { colors } from "../deps.ts";
import { renderColoredExpression } from "../renderColoredExpression.ts";
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
        start: stackItem.start,
        end: stackItem.expressionList.length > 0
          ? stackItem.expressionList.at(-1)!.end
          : stackItem.start,
      })
    }`;
  }

  // deno-lint-ignore no-explicit-any
  throw new Error("Not handled stack type: " + (stackItem as any).stackType);
}

export function logStackItem(stackItem: TParseStackItem): void {
  console.log(renderColoredStackItem(stackItem));
}