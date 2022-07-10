import { ISymbol, LispExpression } from "../ast.ts";
import { Argument, Expression, FunctionDeclaration } from "../js-ast/swc.ts";
import { getNodeByType, querySelector } from "../js-ast/traverse.ts";
import { invariant } from "../syntaxInvariant.ts";
import { binaryOperatorFunctionCallToJsExpression } from "./binaryOperatorFunctionCallToJsExpression.ts";
import { OUT_ENTRYPOINT_PATH, SPAN } from "./constants.ts";
import { isBinaryOperator } from "./isBinaryOperator.ts";
import { isStdLibFunction } from "./isStdLibFunction.ts";
import { methodCall } from "./methodCall.ts";
import { ICompilerState } from "./types.ts";

export function lispExpressionToJsExpression(
  state: ICompilerState,
  expr: LispExpression,
): Expression {
  if (expr.nodeType === "List") {
    invariant(
      expr.elements.length > 0,
      "empty lists are not supported yet",
      expr,
    );
    const funcExpression = expr.elements[0];
    if (funcExpression.nodeType === "Symbol") {
      const functionName = funcExpression.name;
      if (isBinaryOperator(functionName)) {
        return binaryOperatorFunctionCallToJsExpression(state, expr);
      }

      if (funcExpression.member) {
        return methodCall(state, expr);
      }

      const definition = state.files[OUT_ENTRYPOINT_PATH].scope.getDefinition(
        functionName,
      );

      if (!definition) {
        if (isStdLibFunction(functionName)) {
          appendStdLibFunctionDeclaration(
            state,
            OUT_ENTRYPOINT_PATH,
            funcExpression,
          );
        } else {
          invariant(
            false,
            "user defined functions not supported yet",
            expr,
          );
        }
      }

      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          optional: false,
          span: SPAN,
          value: funcExpression.name,
        },
        arguments: expr.elements.slice(1).map((arg): Argument => ({
          expression: lispExpressionToJsExpression(state, arg),
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
    const definition = state.files[OUT_ENTRYPOINT_PATH].scope.getDefinition(
      expr.name,
    );
    invariant(definition, "undefined symbol", expr);
    if (definition.definitionType === "Const") {
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
        expression: lispExpressionToJsExpression(state, e),
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

  const stdFuncDeclaration = querySelector<FunctionDeclaration>(
    (node): node is FunctionDeclaration => {
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
