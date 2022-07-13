import { LispExpression } from "../ast.ts";
import { swcType } from "../deps.ts";
import { IPlaceholderList } from "./IPlaceholderList.ts";

export interface IStatementList {
  append(statement: swcType.Statement): void;
  appendPlaceholder(expression: LispExpression): IPlaceholderList;
  replace(
    statement: swcType.Statement,
    newStatements: swcType.Statement[],
  ): void;
  hoist(statement: swcType.Statement): void;
  defer(cb: () => void): void;
  close(): void;
}
