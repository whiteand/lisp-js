import { ISymbol, LispExpression } from "../ast.ts";
import { swcType } from "../deps.ts";
import { getNodeByType, querySelector } from "../js-ast/traverse.ts";
import { invariant } from "../syntaxInvariant.ts";
import { anonymousFunctionDeclaration } from "./anonymousFunctionDeclaration.ts";
import { binaryOperatorFunctionCallToJsExpression } from "./binaryOperatorFunctionCallToJsExpression.ts";
import { OUT_ENTRYPOINT_PATH, SPAN } from "./constants.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { ifExpressionToJsExpression } from "./ifExpressionToJsExpression.ts";
import { isBinaryOperator } from "./isBinaryOperator.ts";
import { isStdLibFunction } from "./isStdLibFunction.ts";
import { methodCall } from "./methodCall.ts";
import { ICompilerState } from "./types.ts";

export function lispExpressionToJsExpression(
  state: ICompilerState,
  blockStatementList: IBlockStatementList,
  expr: LispExpression,
): swcType.Expression {
  if (expr.nodeType === "List") {
    invariant(
      expr.elements.length > 0,
      "empty lists are not supported yet",
      expr,
    );
    const funcExpression = expr.elements[0];
    if (funcExpression.nodeType === "Symbol") {
      const functionName = funcExpression.name;
      if (functionName === "fn") {
        return anonymousFunctionDeclaration(state, blockStatementList, expr);
      }
      if (functionName === "if") {
        return ifExpressionToJsExpression(state, blockStatementList, expr);
      }
      if (isBinaryOperator(functionName)) {
        return binaryOperatorFunctionCallToJsExpression(
          state,
          blockStatementList,
          expr,
        );
      }

      if (funcExpression.member) {
        return methodCall(state, blockStatementList, expr);
      }

      let definition = blockStatementList.getDefinition(
        functionName,
      );

      if (!definition) {
        if (isStdLibFunction(functionName)) {
          appendStdLibFunctionDeclaration(
            state,
            OUT_ENTRYPOINT_PATH,
            funcExpression,
          );
          definition = blockStatementList.getDefinition(
            functionName,
          );
        }
      }

      invariant(definition, "cannot find definition", funcExpression);

      const added = blockStatementList.tryAddReference(
        funcExpression.name,
        funcExpression,
      );

      invariant(added, "cannot add reference", funcExpression);

      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          optional: false,
          span: SPAN,
          value: funcExpression.name,
        },
        arguments: expr.elements.slice(1).map((arg): swcType.Argument => ({
          expression: lispExpressionToJsExpression(
            state,
            blockStatementList,
            arg,
          ),
        })),
        span: SPAN,
      };
    }
  }
  if (expr.nodeType === "Number") {
    return {
      type: "NumericLiteral",
      value: expr.value,
      span: SPAN,
    };
  }
  if (expr.nodeType === "String") {
    return {
      type: "StringLiteral",
      span: SPAN,
      hasEscape: expr.hasEscape,
      value: expr.value,
    };
  }
  if (expr.nodeType === "Symbol") {
    if (!expr.member && expr.name === "true") {
      return {
        type: "BooleanLiteral",
        span: SPAN,
        value: true,
      };
    }
    if (!expr.member && expr.name === "false") {
      return {
        type: "BooleanLiteral",
        span: SPAN,
        value: false,
      };
    }
    const definition = blockStatementList.getDefinition(
      expr.name,
    );
    invariant(definition, "undefined symbol", expr);
    if (definition.definitionType === "Const") {
      blockStatementList.tryAddReference(expr.name, expr);
      return {
        type: "Identifier",
        optional: false,
        span: SPAN,
        value: expr.name,
      };
    }
    if (definition.definitionType === "FunctionParameter") {
      blockStatementList.tryAddReference(expr.name, expr);
      return {
        type: "Identifier",
        optional: false,
        span: SPAN,
        value: expr.name,
      };
    }
    invariant(
      false,
      `cannot read value defined here: ${JSON.stringify(definition)}`,
      expr,
    );
  }
  if (expr.nodeType === "Vector") {
    return {
      type: "ArrayExpression",
      span: SPAN,
      elements: expr.elements.map((e) => ({
        expression: lispExpressionToJsExpression(state, blockStatementList, e),
      })),
    };
  }
  invariant(false, "cannot compile to js", expr);
}

function appendStdLibFunctionDeclaration(
  state: ICompilerState,
  filePath: string,
  functionNameSymbol: ISymbol,
) {
  const file = state.files[filePath];
  const stdAst = state.fullStdLibAst;
  const program = getNodeByType("Module", file.ast);
  invariant(
    program,
    "cannot find program node in std lib file",
    functionNameSymbol,
  );

  const stdFuncDeclaration = querySelector<swcType.FunctionDeclaration>(
    (node): node is swcType.FunctionDeclaration => {
      if (node.type !== "FunctionDeclaration") {
        return false;
      }
      if (node.identifier.value !== functionNameSymbol.name) {
        return false;
      }
      return true;
    },
    stdAst,
  );
  invariant(
    stdFuncDeclaration,
    "There is no such standard library function",
    functionNameSymbol,
  );
  program.body.unshift(stdFuncDeclaration);
  file.scope.define(functionNameSymbol.name, {
    definitionType: "injected_stdlib_function",
  }, functionNameSymbol);
}

