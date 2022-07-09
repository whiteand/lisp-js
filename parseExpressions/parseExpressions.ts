import { assert } from "../assert.ts";
import { LispExpression } from "../ast.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { renderLexem } from "../renderLexem.ts";
import { TLexem } from "../TLexem.ts";
import { createBackableIterator } from "./createBackableIterator.ts";
import { TParseStackItem } from "./TParseStackItem.ts";
import { LispSyntaxError } from "./LispSyntaxError.ts";
import { logSyntaxAnalyzerState } from "./logSyntaxAnalyzerState.ts";
import { TParseTask } from "./TParseTask.ts";
import { makeTask } from "./makeTask.ts";

export function* parseExpressions(
  locatedLexemsIterator: Iterator<ILocatedLexem>,
): Generator<LispExpression, void, unknown> {
  const locatedLexem$ = createBackableIterator(locatedLexemsIterator);

  function invariant<T>(expr: T, message: string): asserts expr {
    if (expr) return;
    throw LispSyntaxError.fromLocatedLexem(
      message,
      locatedLexem$.getLastValue(),
    );
  }

  const stack: TParseStackItem[] = [];
  const tasks: TParseTask[] = [
    makeTask("parse_expression"),
  ];

  nextTask:
  while (tasks.length >= 0) {
    const task = tasks.pop();
    assert(task, "impossible");
    if (task.type === "yield_expression") {
      const value = stack.pop();
      assert(value, "stack is empty");
      assert(
        value.stackType === "expression",
        `inavlid stack state: expected: expression, actual: ${
          JSON.stringify(value)
        }`,
      );
      yield value.expression;
    }
    if (task.type === "parse_expression") {
      const locatedLexemEntry = locatedLexem$.next();
      if (locatedLexemEntry.done) {
        return;
      }
      const locatedLexem = locatedLexemEntry.value;
      const { lexem } = locatedLexem;

      if (lexem === "(") {
        tasks.push(
          makeTask("parse_expression"),
          makeTask("yield_expression"),
          makeTask("create_function_call_expression"),
          makeTask("parse_close_parens"),
          makeTask("parse_expressions_list"),
          {
            type: "push_expression_list_array",
            start: locatedLexem.start,
            end: locatedLexem.end,
          },
        );
        continue nextTask;
      }

      if (typeof lexem === "number") {
        stack.push({
          stackType: "expression",
          expression: {
            nodeType: "Number",
            value: lexem,
          },
          start: locatedLexem.start,
          end: locatedLexem.end,
        });
        continue nextTask;
      }

      throw new LispSyntaxError(
        `unexpected lexem: ${renderLexem(lexem)}, expected "("` + lexem,
        locatedLexem.start,
        locatedLexem.end,
      );
    }
    if (task.type === "push_expression_list_array") {
      stack.push({
        stackType: "expression_list",
        expressionList: [],
        start: task.start,
        end: task.end,
      });
      continue nextTask;
    }
    if (task.type === "append_to_expression_list") {
      const expressionItem = stack.pop();
      invariant(expressionItem, "syntax analyzer stack is empty");
      if (expressionItem.stackType !== "expression") {
        throw new LispSyntaxError(
          `invalid stack state: expected: expression, actual: ${
            JSON.stringify(expressionItem)
          }`,
          expressionItem.start,
        );
      }
      const arrayItem = stack.pop();
      invariant(arrayItem, "syntax analyzer stack is empty");
      invariant(
        arrayItem.stackType === "expression_list",
        "expected to have expression list in the stack",
      );

      const { expression } = expressionItem;
      const array = arrayItem.expressionList;
    }
    if (task.type === "parse_expressions_list") {
      const locatedLexemEntry = locatedLexem$.next();
      if (locatedLexemEntry.done) {
        throw LispSyntaxError.fromLocatedLexem(
          "expected expression list, but end of code was reached",
          locatedLexem$.getLastValue(),
        );
      }
      const locatedLexem = locatedLexemEntry.value;
      const { lexem } = locatedLexem;
      if (isFinishExpressionListLexem(lexem)) {
        locatedLexem$.back();
        continue nextTask;
      }
      tasks.push(
        makeTask("append_to_expression_list"),
        makeTask("parse_expression"),
      );
      continue nextTask;
    }
    logSyntaxAnalyzerState(
      stack,
      [...tasks, task],
      locatedLexem$.getEntries(),
    );

    throw LispSyntaxError.fromLocatedLexem(
      "syntax parser failed after reading this",
      locatedLexem$.getLastValue(),
    );
  }
}

function isFinishExpressionListLexem(
  lexem: TLexem,
) {
  return lexem === ")";
}
