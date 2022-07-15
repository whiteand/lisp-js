import { IList } from "../ast.ts";
import { swcType } from "../deps.ts";
import { invariant } from "../syntaxInvariant.ts";
import { BlockStatementList } from "./BlockStatementList.ts";
import { compileStatements } from "./compileStatements.ts";
import { SPAN } from "./constants.ts";
import { createBlock } from "./createBlock.ts";
import {
  createIdentifier,
  createSymbolIdentifier,
} from "./createIdentifier.ts";
import { declareVar } from "./declareVar.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { isEven } from "./isEven.ts";
import { isLiteral } from "./isLiteral.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { ICompilerState } from "./types.ts";

export function compileForStatement(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): void {
  const { elements } = expr;
  invariant(elements.length > 2, "for should have body", expr);
  const pairsVector = elements[1];
  invariant(
    pairsVector.nodeType === "Vector",
    "for should have vector of pairs as first argument",
    expr,
  );
  const { elements: pairs } = pairsVector;
  invariant(
    pairs.length > 0,
    "for should have at least one pair.\nExample:\n\t(for [x range] (log x))",
    pairsVector,
  );
  invariant(
    isEven(pairs.length),
    "for first argument should have even number of elements",
    pairsVector,
  );
  const placeholder = blockStatementList.appendPlaceholder(expr);
  for (let i = 0; i < pairs.length; i += 2) {
    const symbol = pairs[i];
    const iterable = pairs[i + 1];
    invariant(symbol.nodeType === "Symbol", "symbol expected", symbol);
    invariant(iterable.nodeType !== "Void", "iterable expected", iterable);
    invariant(iterable.nodeType !== "Number", "iterable expected", iterable);
    invariant(iterable.nodeType !== "BigInt", "iterable expected", iterable);
    const symbolDefinition = blockStatementList.getDefinition(symbol.name);
    invariant(
      !symbolDefinition,
      "iterator symbol is already defined in parent scope.",
      symbol,
    );
    blockStatementList.tryAddReference(symbol.name, symbol);
  }

  blockStatementList.defer(() => {
    const iterablesJs = new Map<number, swcType.Expression>();
    for (let i = 0; i < pairs.length; i += 2) {
      const iterable = pairs[i + 1];
      if (isLiteral(iterable)) {
        const name = placeholder.defineRandom({
          definitionType: "Placeholder",
          expression: iterable,
        });
        const jsId = createIdentifier(name);
        iterablesJs.set(i / 2, jsId);
        placeholder.append(
          declareVar(
            "const",
            jsId,
            lispExpressionToJsExpression(
              state,
              placeholder,
              iterable,
            ),
          ),
        );
        continue;
      }
    }
    let currentBlock: IBlockStatementList = placeholder;
    for (let i = 0; i < pairs.length; i += 2) {
      console.log(Object.keys(currentBlock.getDefinitions()));
      const symbol = pairs[i];
      const iterable = pairs[i + 1];
      const pairIndex = i >>> 1;
      if (!iterablesJs.has(pairIndex)) {
        if (iterable.nodeType === "Symbol") {
          invariant(
            currentBlock.getDefinition(iterable.name),
            "iterable is not defined",
            iterable,
          );
          iterablesJs.set(pairIndex, createSymbolIdentifier(iterable));
          currentBlock.tryAddReference(iterable.name, iterable)
        } else {
          const name = currentBlock.defineRandom({
            definitionType: "Placeholder",
            expression: iterable,
          });
          const idJs = createIdentifier(name);
          iterablesJs.set(pairIndex, idJs);
          currentBlock.append(
            declareVar(
              "const",
              idJs,
              lispExpressionToJsExpression(
                state,
                currentBlock,
                iterable,
              ),
            ),
          );
        }
      }
      invariant(symbol.nodeType === "Symbol", "impossible", symbol);

      const iterableJs = iterablesJs.get(pairIndex);
      invariant(iterableJs, "Not defined iterable js", iterable);
      const loop: swcType.ForOfStatement & { body: swcType.BlockStatement } = {
        type: "ForOfStatement",
        span: SPAN,
        await: null as any,
        left: declareVar("const", createSymbolIdentifier(symbol), null),
        right: iterableJs,
        body: createBlock(),
      };
      currentBlock.append(loop);
      currentBlock.define(symbol.name, {
        definitionType: "Placeholder",
        expression: symbol,
      }, symbol);
      currentBlock = new BlockStatementList(
        currentBlock.createChild(),
        loop.body,
      );
    }

    compileStatements(state, currentBlock, elements.slice(2));
    placeholder.close();
  });
}
