import { assert } from "../assert.ts";
import { colors } from "../deps.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { renderLexem } from "../renderLexem.ts";
import { logStackItem } from "./logStackItem.ts";
import { TParseStackItem } from "./TParseStackItem.ts";
import { TParseTask } from "./TParseTask.ts";
import { renderColoredTask } from './renderColoredTask.ts'

export function logSyntaxAnalyzerState(
  stack: TParseStackItem[],
  notFinishedTasks: TParseTask[],
  readEntries: IteratorYieldResult<ILocatedLexem>[],
): void {
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
    assert(task, 'impossible state')
    console.log(renderColoredTask(task));
  }
  console.log(colors.blue("code that was read"));
  const res: string[] = [];
  for (const entry of readEntries) {
    res.push(renderLexem(entry.value.lexem));
  }
  console.log(res.join(" "));
}
