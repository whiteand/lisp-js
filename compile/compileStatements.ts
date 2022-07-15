import { LispExpression } from "../ast.ts";
import { invariant } from "../syntaxInvariant.ts";
import { compileStatement } from "./compileStatement.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { ICompilerState } from "./types.ts";

export function compileStatements(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expressions: Iterable<LispExpression>,
): void {
  for (const expr of expressions) {
    invariant(
      expr.nodeType !== "BigInt",
      "This statement cannot be global",
      expr,
    );
    invariant(
      expr.nodeType !== "Number",
      "This statement cannot be global",
      expr,
    );
    invariant(
      expr.nodeType !== "Symbol",
      "This statement cannot be global",
      expr,
    );
    invariant(
      expr.nodeType !== "Vector",
      "This statement cannot be global",
      expr,
    );
    if (expr.nodeType === "List") {
      compileStatement(state, blockStatementList, expr);
      continue;
    }
    invariant(false, "Unsupported expression", expr);
  }
}
