import { swcType } from "../deps.ts";

export interface IStatementList {
  append(statement: swcType.Statement): void;
  hoist(statement: swcType.Statement): void;
  defer(cb: () => void): void;
  close(): void;
}
