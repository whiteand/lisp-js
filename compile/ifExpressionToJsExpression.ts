import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { BlockStatementList } from "./BlockStatementList.ts";
import { SPAN } from "./constants.ts";
import { createBlock } from "./createBlock.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { declareVar } from "./declareVar.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

export function ifExpressionToJsExpression(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
  const { elements } = expr;
  invariant(
    elements.length === 4,
    "If statement should have 3 parameters",
    expr,
  );
  const testExpr = elements[1];
  const consequentExpr = elements[2];
  const alternateExpr = elements[3];
  const placeholder = blockStatementList.appendPlaceholder(expr);
  const resJsId: swcType.Identifier = createIdentifier("_DUMMY_");
  blockStatementList.defer(() => {
    const testId: swcType.Identifier = testExpr.nodeType === "Symbol"
      ? createIdentifier(testExpr.name)
      : createIdentifier(
        placeholder.defineRandom({
          definitionType: "IfTestExpression",
        }),
      );
    const resJsIdName = placeholder.defineRandom({
      definitionType: "IfResultExpression",
    });
    resJsId.value = resJsIdName;
    if (testExpr.nodeType !== "Symbol") {
      placeholder.append(
        declareVar(
          "const",
          testId,
          lispExpressionToJsExpression(state, placeholder, testExpr),
        ),
      );
    }

    placeholder.append(declareVar("let", resJsId, {
      type: "NullLiteral",
      span: SPAN,
    }));
    const consequentBlock = createBlock();
    const alternateBlock = createBlock();
    placeholder.append({
      type: "IfStatement",
      span: SPAN,
      test: testId,
      consequent: consequentBlock,
      alternate: alternateBlock,
    });
    const consequentBlockList = new BlockStatementList(
      placeholder.createChild(),
      consequentBlock,
    );
    consequentBlockList.append({
      type: "ExpressionStatement",
      span: SPAN,
      expression: {
        span: SPAN,
        type: "AssignmentExpression",
        left: createIdentifier(resJsIdName),
        operator: "=",
        right: lispExpressionToJsExpression(
          state,
          consequentBlockList,
          consequentExpr,
        ),
      },
    });
    consequentBlockList.close();

    const alternateBlockList = new BlockStatementList(
      placeholder.createChild(),
      alternateBlock,
    );
    alternateBlockList.append({
      type: "ExpressionStatement",
      span: SPAN,
      expression: {
        span: SPAN,
        type: "AssignmentExpression",
        left: createIdentifier(resJsIdName),
        operator: "=",
        right: lispExpressionToJsExpression(
          state,
          alternateBlockList,
          alternateExpr,
        ),
      },
    });
    alternateBlockList.close();
    placeholder.close();
  });
  return resJsId;
}
