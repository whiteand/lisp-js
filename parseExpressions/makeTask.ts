import { TParseTask } from "./TParseTask.ts";
import { Values } from "./Values.ts";

type OnlyTypeTaskType = Values<
  {
    [key in TParseTask["type"]]: { type: key } extends
      Extract<TParseTask, { type: key }> ? { type: key } : never;
  }
>["type"];

const taskPerType = new Map<
  OnlyTypeTaskType,
  TParseTask
>();

export function makeTask(
  type: OnlyTypeTaskType,
): TParseTask {
  if (!taskPerType.has(type)) {
    taskPerType.set(type, {
      type,
    });
  }
  return taskPerType.get(type)!;
}
