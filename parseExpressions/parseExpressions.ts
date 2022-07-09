import { assert } from "../assert.ts";
import { LispExpression } from "../ast.ts";
import { ILocatedLexem } from "../ILocatedLexem.ts";
import { renderLexem } from "../renderLexem.ts";
import { TLexem } from "../TLexem.ts";
import { createBackableIterator } from "../createBackableIterator.ts";
import { TParseStackItem } from "./TParseStackItem.ts";
import { LispSyntaxError } from "./LispSyntaxError.ts";
import { logSyntaxAnalyzerState } from "./logSyntaxAnalyzerState.ts";
import { TParseTask } from "./TParseTask.ts";
import { makeTask } from "./makeTask.ts";

export function* parseExpressions(
  locatedLexemsIterator: Iterator<ILocatedLexem>,
): Generator<LispExpression, void, unknown> {
  const locatedLexem$ = createBackableIterator(locatedLexemsIterator);
  let task: TParseTask | undefined;

  function invariant<T>(
    expr: T,
    message: string,
    options?: { logDiagnostics?: boolean },
  ): asserts expr {
    if (expr) return;
    if (options?.logDiagnostics) {
      logSyntaxAnalyzerState(
        stack,
        task ? [...tasks, task] : tasks,
        locatedLexem$.getEntries(),
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
          makeTask("create_function_call_expression"),
          makeTask("parse_close_parens_and_push_location"),
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
        logSyntaxAnalyzerState(
          stack,
          [...tasks, task],
          locatedLexem$.getEntries().slice(
            0,
            locatedLexem$.getNextEntryIndex(),
          ),
        );
        throw LispSyntaxError.fromLocatedLexem(
          `Unexpected ')'`,
          locatedLexem,
        );
      }
      if (lexem.type === "symbol") {
        stack.push({
          stackType: "expression",
          expression: {
            nodeType: "Symbol",
            name: lexem.value,
            start: locatedLexem.start,
            end: locatedLexem.end,
          },
        });
        continue nextTask;
      }

      invariant(
        false,
        `unhandled lexem: ${renderLexem(lexem)}, expected "("` + lexem,
        { logDiagnostics: true },
      );
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
    if (task.type === "create_function_call_expression") {
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
        nodeType: "FunctionCall",
        function: expressionListItem.expressionList[0],
        arguments: expressionListItem.expressionList.slice(1),
        start: expressionListItem.start,
        end: closeParensLocation.location,
      };
      stack.push({
        stackType: "expression",
        expression: functionCallExpression,
      });
      continue;
    }

    logSyntaxAnalyzerState(
      stack,
      [...tasks, task],
      locatedLexem$.getEntries(),
    );

    invariant(false, `Syntax Parser failed executing ${task.type}`, {
      logDiagnostics: true,
    });
  }
}

function isFinishExpressionListLexem(
  lexem: TLexem,
) {
  return lexem === ")";
}