import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { BlockStatementList } from "./BlockStatementList.ts";
import { compileStatement } from "./compileStatement.ts";
import { SPAN } from "./constants.ts";
import { createBlock } from "./createBlock.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

export function compileIfStatement(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  e: IList,
): void {
  const { elements } = e;
  invariant(elements.length === 4, "If statement should have 3 parameters", e);
  const testExpr = elements[1];
  const consequentExpr = elements[2];
  const alternateExpr = elements[3];
  const testJsExpr = lispExpressionToJsExpression(
    state,
    blockStatementList,
    testExpr,
  );
  const consequentBlock: swcType.BlockStatement = createBlock();
  const alternateBlock: swcType.BlockStatement = createBlock();
  const ifStatement: swcType.IfStatement = {
    type: "IfStatement",
    span: SPAN,
    consequent: consequentBlock,
    alternate: alternateBlock,
    test: testJsExpr,
  };
  blockStatementList.append(ifStatement);

  const consequentBlockList = new BlockStatementList(
    blockStatementList.createChild(),
    consequentBlock,
  );
  invariant(
    consequentExpr.nodeType === "List",
    "This will not have any effect",
    consequentExpr,
  );
  compileStatement(state, consequentBlockList, consequentExpr);

  const alternateBlockList = new BlockStatementList(
    blockStatementList.createChild(),
    alternateBlock,
  );
  invariant(
    alternateExpr.nodeType === "List",
    "This will not have any effect",
    alternateExpr,
  );
  compileStatement(state, alternateBlockList, alternateExpr);
}
