import { assert } from "../assert.ts";
import { IVectorExpression, LispExpression } from "../ast.ts";
import { createBackableIterator } from "../createBackableIterator.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { renderLexem } from "../renderLexem.ts";
import { TLexem } from "../TLexem.ts";
import { logSyntaxAnalyzerState } from "./logSyntaxAnalyzerState.ts";
import { makeTask } from "./makeTask.ts";
import { TParseStackItem } from "./TParseStackItem.ts";
import { TParseTask } from "./TParseTask.ts";

export function* parseExpressions(
  locatedLexemsIterator: Iterator<ILocatedLexem>,
): Generator<LispExpression, void, unknown> {
  const locatedLexem$ = createBackableIterator(
    locatedLexemsIterator,
  );
  let task: TParseTask | undefined;

  function invariant<T>(
    expr: T,
    message: string,
    state?: {
      stack: TParseStackItem[];
      tasks: TParseTask[];
      entries: IteratorYieldResult<ILocatedLexem>[];
    },
  ): asserts expr {
    if (expr) return;
    if (state) {
      logSyntaxAnalyzerState(
        state.stack,
        state.tasks,
        state.entries,
      );
    }
    throw LispSyntaxError.fromLocatedLexem(
      message,
      locatedLexem$.getLastValue(),
    );
  }

  const stack: TParseStackItem[] = [];
  const tasks: TParseTask[] = [
    makeTask("parse_program"),
  ];

  nextTask:
  while (tasks.length > 0) {
    task = tasks.pop();
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
      continue nextTask;
    }
    if (task.type === "parse_program") {
      while (true) {
        const entry = locatedLexem$.next();
        if (entry.done) {
          continue nextTask;
        }
        if (entry.value.lexem === " ") {
          continue;
        }
        break;
      }

      locatedLexem$.back();

      tasks.push(
        makeTask("parse_program"),
        makeTask("yield_expression"),
        makeTask("parse_expression"),
      );
      continue nextTask;
    }
    if (task.type === "parse_expression") {
      const locatedLexemEntry = locatedLexem$.next();
      if (locatedLexemEntry.done) {
        return;
      }
      const locatedLexem = locatedLexemEntry.value;
      const { lexem } = locatedLexem;

      if (lexem === " ") {
        tasks.push(task);
        continue nextTask;
      }

      if (lexem === "(") {
        tasks.push(
          makeTask("create_list_expression"),
          makeTask("parse_close_parens_and_push_location"),
          makeTask("parse_expressions_list"),
          {
            type: "push_expression_list_array",
            start: locatedLexem.start,
          },
        );
        continue nextTask;
      }

      if (lexem === "[") {
        tasks.push(
          makeTask("create_vector_expression"),
          makeTask("parse_close_bracket_and_push_location"),
          makeTask("parse_expressions_list"),
          {
            type: "push_expression_list_array",
            start: locatedLexem.start,
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
            start: locatedLexem.start,
            end: locatedLexem.end,
          },
        });
        continue nextTask;
      }

      if (typeof lexem === "bigint") {
        stack.push({
          stackType: "expression",
          expression: {
            nodeType: "BigInt",
            value: lexem,
            start: locatedLexem.start,
            end: locatedLexem.end,
          },
        });
        continue nextTask;
      }

      if (lexem === ")") {
        throw LispSyntaxError.fromLocatedLexem(
          `Unexpected ')'`,
          locatedLexem,
        );
      }
      if (lexem === "]") {
        throw LispSyntaxError.fromLocatedLexem('Unexpected "]"', locatedLexem);
      }

      if (lexem.type === "symbol") {
        stack.push({
          stackType: "expression",
          expression: {
            nodeType: "Symbol",
            name: lexem.value,
            start: locatedLexem.start,
            end: locatedLexem.end,
            member: lexem.value.startsWith("."),
          },
        });
        continue nextTask;
      }
      if (lexem.type === "comment" || lexem.type === "newline") {
        tasks.push(task);
        continue nextTask;
      }

      logSyntaxAnalyzerState(
        stack,
        [...tasks, task],
        locatedLexem$.getEntries(),
      );
      throw LispSyntaxError.fromLocatedLexem("unhandled lexem", locatedLexem);
    }
    if (task.type === "push_expression_list_array") {
      stack.push({
        stackType: "expression_list",
        expressionList: [],
        start: task.start,
      });
      continue nextTask;
    }
    if (task.type === "append_to_expression_list") {
      const expressionItem = stack.pop();
      invariant(expressionItem, "syntax analyzer stack is empty");
      invariant(
        expressionItem.stackType === "expression",
        "Expected expression on the stack",
      );
      const arrayItem = stack.pop();
      invariant(arrayItem, "syntax analyzer stack is empty");
      invariant(
        arrayItem.stackType === "expression_list",
        "expected to have expression list in the stack",
      );

      const { expression } = expressionItem;
      const array = arrayItem.expressionList;
      array.push(expression);
      stack.push(arrayItem);
      continue nextTask;
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
      locatedLexem$.back();
      tasks.push(
        makeTask("parse_expressions_list"),
        makeTask("append_to_expression_list"),
        makeTask("parse_expression"),
      );
      continue nextTask;
    }
    if (task.type === "parse_close_parens_and_push_location") {
      const locatedLexemEntry = locatedLexem$.next();
      if (locatedLexemEntry.done) {
        throw LispSyntaxError.fromLocatedLexem(
          "expected ')', but end of code was reached",
          locatedLexem$.getLastValue(),
        );
      }
      const locatedLexem = locatedLexemEntry.value;
      const { lexem } = locatedLexem;
      if (lexem !== ")") {
        throw LispSyntaxError.fromLocatedLexem(
          `expected ')' but got: ${renderLexem(lexem)}`,
          locatedLexem,
        );
      }
      stack.push({
        stackType: "location",
        location: locatedLexem.end,
      });
      continue nextTask;
    }
    if (task.type === "parse_close_bracket_and_push_location") {
      const locatedLexemEntry = locatedLexem$.next();
      if (locatedLexemEntry.done) {
        throw LispSyntaxError.fromLocatedLexem(
          "expected ']', but end of code was reached",
          locatedLexem$.getLastValue(),
        );
      }
      const locatedLexem = locatedLexemEntry.value;
      const { lexem } = locatedLexem;
      if (lexem !== "]") {
        throw LispSyntaxError.fromLocatedLexem(
          `expected ']' but got: ${renderLexem(lexem)}`,
          locatedLexem,
        );
      }
      stack.push({
        stackType: "location",
        location: locatedLexem.end,
      });
      continue nextTask;
    }
    if (task.type === "create_list_expression") {
      const closeParensLocation = stack.pop();
      invariant(
        closeParensLocation,
        "cannot get close parens location from empty stack",
      );
      invariant(
        closeParensLocation.stackType === "location",
        "expected location on the stack",
      );
      const expressionListItem = stack.pop();
      invariant(
        expressionListItem,
        "cannot get function call expressions from empty stack",
      );
      invariant(
        expressionListItem.stackType === "expression_list",
        "expected expression list on the stack",
      );
      const functionCallExpression: LispExpression = {
        nodeType: "List",
        elements: expressionListItem.expressionList,
        start: expressionListItem.start,
        end: closeParensLocation.location,
      };
      stack.push({
        stackType: "expression",
        expression: functionCallExpression,
      });
      continue;
    }
    if (task.type === "create_vector_expression") {
      const closeBracketLocation = stack.pop();
      invariant(
        closeBracketLocation,
        "cannot get close parens location from empty stack",
      );
      invariant(
        closeBracketLocation.stackType === "location",
        "expected location on the stack",
      );
      const expressionListItem = stack.pop();
      invariant(
        expressionListItem,
        "cannot get function call expressions from empty stack",
      );
      invariant(
        expressionListItem.stackType === "expression_list",
        "expected expression list on the stack",
      );
      const functionCallExpression: IVectorExpression = {
        nodeType: "Vector",
        elements: expressionListItem.expressionList,
        start: expressionListItem.start,
        end: closeBracketLocation.location,
      };
      stack.push({
        stackType: "expression",
        expression: functionCallExpression,
      });
      continue;
    }

    invariant(false, `Syntax Parser failed executing ${task.type}`, {
      stack,
      tasks: [...tasks, task],
      entries: locatedLexem$.getEntries(),
    });
  }
}

function isFinishExpressionListLexem(
  lexem: TLexem,
) {
  return lexem === ")" || lexem === "]";
}
