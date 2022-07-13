import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { ICompilerState } from "./types.ts";

export function ifExpressionToJsExpression(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
  invariant(false, "Not implemented yet", expr);
}
