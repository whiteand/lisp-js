import { colors } from "../deps.ts";
import { renderLocation } from "../renderLocation.ts";
import { TParseTask } from "./TParseTask.ts";

const ONLY_TYPE_TASK_TYPES = [
  "parse_expression",
  "yield_expression",
  "parse_function_expression",
  "parse_function_params",
  "create_function_call_expression",
  "parse_expressions_list",
  "append_to_expression_list",
  'parse_close_parens_and_push_location'
] as const;

const ONLY_TYPE_TASK_SET = new Set<string>(ONLY_TYPE_TASK_TYPES);

function isOnlyTypeTask(
  task: TParseTask,
): task is Extract<TParseTask, { type: typeof ONLY_TYPE_TASK_TYPES[number] }> {
  return ONLY_TYPE_TASK_SET.has(task.type);
}
export function renderColoredTask(task: TParseTask): string {
  if (isOnlyTypeTask(task)) {
    return colors.yellow(task.type);
  }
  if (task.type === "push_expression_list_array") {
    return `${colors.yellow(task.type)}: ${renderLocation(task.start)}`;
  }
  throw new Error("not handled task: " + JSON.stringify(task));
}
