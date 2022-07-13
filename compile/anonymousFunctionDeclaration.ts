import { IList, ISymbol } from "../ast.ts";
import { swcType } from "../deps.ts";
import { LispSyntaxError } from "../LispSyntaxError.ts";
import { renderExpression } from "../renderExpression.ts";
import { invariant } from "../syntaxInvariant.ts";
import { BlockStatementList } from "./BlockStatementList.ts";
import { compileStatement } from "./compileStatement.ts";
import { SPAN } from "./constants.ts";
import { createBlock } from "./createBlock.ts";
import { createIdentifier } from "./createIdentifier.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { lispExpressionToJsExpression } from "./lispExpressionToJsExpression.ts";
import { symbolToId } from "./symbolToIdentifier.ts";
import { ICompilerState } from "./types.ts";

export function anonymousFunctionDeclaration(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: IList,
): swcType.Expression {
  invariant(expr.elements.length >= 2, "function should have parameters", expr);
  const parametersVector = expr.elements[1];
  invariant(
    parametersVector.nodeType === "Vector",
    "parameters should be a vector.\nExample:\n\t(fn [x] (* x x))\n\t     ^",
    parametersVector,
  );
  const parameters: ISymbol[] = [];
  const vectorEleements = parametersVector.elements;
  for (let i = 0; i < vectorEleements.length; i++) {
    const parameter = vectorEleements[i];
    if (!parameter) {
      continue;
    }
    invariant(
      parameter.nodeType === "Symbol",
      "parameter should be a symbol.",
      parameter,
    );
    parameters.push(parameter);
  }
  invariant(
    expr.elements.length >= 3,
    "function should have at least one expression in the body of a function",
    expr,
  );

  const functionBody = createBlock();

  const functionNameSymbol: ISymbol = {
    nodeType: "Symbol",
    start: expr.start,
    end: expr.end,
    member: false,
    name: "anonymous",
  };
  functionNameSymbol.name = "_DUMMY_";
  const functionIdentifierJs: swcType.Identifier = createIdentifier(
    "__DUMMY_ID__",
  );
  const functionDeclaration: swcType.FunctionDeclaration = {
    type: "FunctionDeclaration",
    async: false,
    body: functionBody,
    span: SPAN,
    declare: false,
    generator: false,
    identifier: functionIdentifierJs,
    params: parameters.map((parameter): swcType.Param => ({
      pat: createIdentifier(symbolToId(parameter.name)),
      span: SPAN,
      type: "Parameter",
    })),
  };
  blockStatementList.defer(() => {
    const name = blockStatementList.defineRandom({
      definitionType: "AnonymousFunction",
      minParametersNumber: parameters.length,
      value: functionNameSymbol,
    });
    functionIdentifierJs.value = name;
    blockStatementList.hoist(functionDeclaration);
    const functionScope = blockStatementList.createChild();
    const functionBlockStatementList = new BlockStatementList(
      functionScope,
      functionBody,
    );
    functionBlockStatementList.defer(() => {
      const notUsedParams: ISymbol[] = [];
      let i = parameters.length - 1;
      while (i >= 0) {
        const param = parameters[i--];
        if (functionBlockStatementList.getReferences(param.name).length > 0) {
          break;
        }
        notUsedParams.push(param);
      }
      if (notUsedParams.length > 0) {
        notUsedParams.reverse();
        throw new LispSyntaxError(
          `Not used parameters:${
            notUsedParams.map((param) => param.name).join(",")
          }\n\t${renderExpression(expr)}`,
          notUsedParams[0].start,
          notUsedParams.at(-1)!.end,
        );
      }
    });

    for (const param of parameters) {
      functionBlockStatementList.define(param.name, {
        definitionType: "FunctionParameter",
        symbol: param,
      }, param);
    }
    for (let i = 2; i < expr.elements.length - 1; i++) {
      const statementExpression = expr.elements[i];
      invariant(
        statementExpression.nodeType !== "BigInt",
        "This expression will not have any effect",
        statementExpression,
      );
      invariant(
        statementExpression.nodeType !== "String",
        "This expression will not have any effect",
        statementExpression,
      );
      invariant(
        statementExpression.nodeType !== "Symbol",
        "This expression will not have any effect",
        statementExpression,
      );
      invariant(
        statementExpression.nodeType !== "Vector",
        "This expression will not have any effect",
        statementExpression,
      );
      invariant(
        statementExpression.nodeType !== "Number",
        "This expression will not have any effect",
        statementExpression,
      );
      invariant(
        statementExpression.nodeType !== "Void",
        "This expression will not have any effect",
        statementExpression,
      );
      compileStatement(state, functionBlockStatementList, statementExpression);
    }

    const resultExpression = expr.elements[expr.elements.length - 1];
    invariant(resultExpression, "impossible failure", expr);

    functionBlockStatementList.append({
      type: "ReturnStatement",
      span: SPAN,
      argument: lispExpressionToJsExpression(
        state,
        functionBlockStatementList,
        resultExpression,
      ),
    });

    functionBlockStatementList.close();
  });

  return functionIdentifierJs;
}
