import { assert } from "../assert.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { renderLexem } from "../renderLexem.ts";
import { logStackItem } from "./logStackItem.ts";
import { TParseStackItem } from "./TParseStackItem.ts";
import { TParseTask } from "./TParseTask.ts";
import { renderColoredTask } from "./renderColoredTask.ts";
import { TLexem } from "../TLexem.ts";
import { ColorsContext } from "../contexts/colors.ts";

export function logSyntaxAnalyzerState(
  stack: TParseStackItem[],
  notFinishedTasks: TParseTask[],
  readEntries: IteratorYieldResult<ILocatedLexem>[],
): void {
  const colors = ColorsContext.getValue();
  if (stack.length > 0) {
    console.error(colors.blue("stack:"));
    while (stack.length > 0) {
      const stackItem = stack.pop();
      assert(stackItem, "impossible");
      logStackItem(stackItem);
    }
  } else {
    console.log(colors.blue("stack is empty"));
  }
  console.error(colors.blue("tasks"));
  while (notFinishedTasks.length > 0) {
    const task = notFinishedTasks.pop();
    assert(task, "impossible state");
    console.log(renderColoredTask(task));
  }
  console.log(colors.blue("code that was read:"));
  console.log(colors.gray("```lisp-js"));
  const lexems = readEntries.slice(-10).map((e) => e.value.lexem);
  console.log(renderLexems(lexems));
  console.log(colors.gray("```"));
  console.log();
}

function renderLexems(lexems: TLexem[]) {
  let res = "";
  let lastLexem = null;
  for (const lexem of lexems) {
    if (!lastLexem) {
      res += renderLexem(lexem);
      lastLexem = lexem;
      continue;
    }
    if (
      lastLexem === "(" || lastLexem === " " || lastLexem === "[" || lexem ===
        "]"
    ) {
      res += renderLexem(lexem);
      lastLexem = lexem;
      continue;
    }
    res += " ";
    res += renderLexem(lexem);
    lastLexem = lexem;
  }
  return res;
}
