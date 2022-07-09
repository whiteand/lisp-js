import { assert } from "../assert.ts";
import { IFunctionCall, ISymbol, LispExpression } from "../ast.ts";
import { colors } from "../deps.ts";
import {
  Argument,
  Expression,
  ImportDeclaration,
  ImportSpecifier,
  Module,
  Statement,
} from "../js-ast/swc.ts";
import { getNodeByType, querySelector } from "../js-ast/traverse.ts";
import { renderColoredExpression } from "../renderColoredExpression.ts";
import { renderLocationRange } from "../renderLocationRange.ts";

const STD_LIB_FILE = "lisp-js.js";
const STD_LIB_FILE_WITHOUT_EXTENSION = STD_LIB_FILE.replace(/\.js$/, "");

interface IBundleFile {
  relativePath: string;
  ast: Module;
}

type StdLibFunctionName = "log";

const SPAN = {
  ctxt: 0,
  start: 0,
  end: 0,
};

export function* compile(
  expression$: Iterable<LispExpression>,
): Generator<IBundleFile, void, unknown> {
  const state: ICompilerState = {
    stdLib: {
      ast: {
        type: "Module",
        interpreter: null,
        span: SPAN,
        body: [],
      },
      importedSymbols: new Set<string>(),
      exportedSymbols: new Set<string>(),
    },
    indexJs: {
      ast: {
        type: "Module",
        span: SPAN,
        interpreter: null,
        body: [
          //   multilineDocCommentNode(
          //     "Automatically Generated by lisp-js. Andrew Beletskiy (c) 2022 - now",
          //   ),
        ],
      },
      importedSymbols: new Set<string>(),
      exportedSymbols: new Set<string>(),
    },
  };

  for (const expr of expression$) {
    if (expr.nodeType === "BigInt") continue;
    if (expr.nodeType === "Number") continue;
    if (expr.nodeType === "Symbol") continue;
    if (expr.nodeType === "Vector") continue;
    if (expr.nodeType === "FunctionCall") {
      handleGlobalFunctionCall(state, expr);
      continue;
    }
    throw new Error(
      `${
        colors.gray(renderLocationRange((expr as any).start, (expr as any).end))
      } :: Cannot transform ${renderColoredExpression(expr)}`,
    );
  }

  yield {
    relativePath: STD_LIB_FILE,
    ast: state.stdLib.ast,
  };

  yield {
    relativePath: "index.js",
    ast: state.indexJs.ast,
  };
}

interface IBundleFileState {
  ast: Module;
  importedSymbols: Set<string>;
  exportedSymbols: Set<string>;
}

interface ICompilerState {
  stdLib: IBundleFileState;
  indexJs: IBundleFileState;
}

function handleGlobalFunctionCall(
  state: ICompilerState,
  expr: IFunctionCall,
) {
  const { function: func, start, end } = expr;
  if (func.nodeType === "Symbol") {
    ensureFunctionNameIsAvailable(state, func);
    const jsExpression = lispExpressionToJsExpression(state, expr);
    const expressionStatement: Statement = {
      type: "ExpressionStatement",
      span: SPAN,
      expression: jsExpression,
    };
    appendStatement(state.indexJs.ast, expressionStatement);
    return;
  }
  throw new Error(
    `${colors.gray(renderLocationRange(start, end))} :: Cannot transform ${
      renderColoredExpression(expr)
    } to js`,
  );
}

function ensureFunctionNameIsAvailable(
  state: ICompilerState,
  funcExpr: ISymbol,
) {
  const { name } = funcExpr;
  if (isStdLibFunction(name)) {
    ensureStdLibFunctionImported(state, funcExpr);
    return;
  }
  throw new Error(
    `${
      colors.gray(renderLocationRange(funcExpr.start, funcExpr.end))
    } :: Cannot ensure ${renderColoredExpression(funcExpr)} is defined`,
  );
}

function isStdLibFunction(name: string): name is StdLibFunctionName {
  return name === "log";
}

function ensureStdLibFunctionImported(
  state: ICompilerState,
  funcNameExpr: ISymbol,
) {
  if (!state.stdLib.exportedSymbols.has(funcNameExpr.name)) {
    addStdLibExport(state.stdLib, funcNameExpr.name as StdLibFunctionName);
  }
  if (!state.indexJs.importedSymbols.has(funcNameExpr.name)) {
    addStdLibImport(state.indexJs, funcNameExpr.name as StdLibFunctionName);
  }
}

function binaryOperatorFunctionCallToJsExpression(
  state: ICompilerState,
  expr: IFunctionCall,
): Expression {
  assert(expr.function.nodeType === "Symbol", "impossible state");
  const operator = expr.function.name as "+" | "*";
  if (operator === "+") {
    if (expr.arguments.length <= 0) {
      return {
        type: "NumericLiteral",
        span: SPAN,
        value: 0,
      };
    }
    if (expr.arguments.length === 1) {
      return lispExpressionToJsExpression(state, expr.arguments[0]);
    }
  }
  if (operator === "*") {
    if (expr.arguments.length <= 0) {
      return {
        type: "NumericLiteral",
        span: SPAN,
        value: 1,
      };
    }
    if (expr.arguments.length === 1) {
      return lispExpressionToJsExpression(state, expr.arguments[0]);
    }
  }
  const root: Expression = {
    type: "BinaryExpression",
    span: SPAN,
    operator,
    left: {
      type: "NumericLiteral",
      span: SPAN,
      value: 0,
    },
    right: {
      type: "NumericLiteral",
      span: SPAN,
      value: 0,
    },
  };
  let res = root;

  let i = expr.arguments.length - 1;
  while (i >= 2) {
    const arg = expr.arguments[i];
    i--;
    const jsExpr = lispExpressionToJsExpression(state, arg);
    res.right = jsExpr;
    res.left = {
      type: "BinaryExpression",
      span: SPAN,
      operator,
      left: {
        type: "NumericLiteral",
        span: SPAN,
        value: 0,
      },
      right: {
        type: "NumericLiteral",
        span: SPAN,
        value: 0,
      },
    };
    res = res.left;
  }
  res.left = lispExpressionToJsExpression(state, expr.arguments[0]);
  res.right = lispExpressionToJsExpression(state, expr.arguments[1]);

  return root;
}

function isBinaryOperator(name: string) {
  return name === "+" || name === "*";
}

function lispExpressionToJsExpression(
  state: ICompilerState,
  expr: LispExpression,
): Expression {
  if (expr.nodeType === "FunctionCall") {
    if (expr.function.nodeType === "Symbol") {
      const functionName = expr.function.name;
      if (isBinaryOperator(functionName)) {
        return binaryOperatorFunctionCallToJsExpression(state, expr);
      }
      return {
        type: "CallExpression",
        callee: {
          type: "Identifier",
          optional: false,
          span: SPAN,
          value: expr.function.name,
        },
        arguments: expr.arguments.map((arg): Argument => ({
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
  throw new Error(
    "Cannot transform to js expression: " + renderColoredExpression(expr) +
      "\n",
  );
}

function appendStatement(ast: Module, jsStatement: Statement) {
  const module = getNodeByType("Module", ast);
  assert(module, "There is no module in the ast");
  module.body.push(jsStatement);
}

function addStdLibExport(
  stdLibFile: IBundleFileState,
  name: StdLibFunctionName,
) {
  const program = getNodeByType("Module", stdLibFile.ast);
  assert(program, "cannot find program node in std lib file");
  if (name === "log") {
    stdLibFile.exportedSymbols.add(name);
    program.body.push({
      type: "ExportDeclaration",
      span: SPAN,
      declaration: {
        declare: false,
        span: SPAN,
        type: "FunctionDeclaration",
        async: false,
        generator: false,
        identifier: {
          span: {
            start: 0,
            end: 3,
            ctxt: 0,
          },
          type: "Identifier",
          value: "log",
          optional: false,
        },
        params: [],
        body: {
          span: SPAN,
          type: "BlockStatement",
          stmts: [
            {
              span: SPAN,
              type: "ExpressionStatement",
              expression: {
                span: SPAN,
                "type": "CallExpression",
                "callee": {
                  span: SPAN,
                  "type": "MemberExpression",
                  "object": {
                    span: SPAN,
                    "type": "MemberExpression",
                    "object": {
                      optional: false,
                      span: SPAN,
                      "type": "Identifier",
                      "value": "console",
                    },
                    "property": {
                      optional: false,
                      span: SPAN,
                      "type": "Identifier",
                      "value": "log",
                    },
                  },
                  "property": {
                    optional: false,
                    span: SPAN,
                    "type": "Identifier",
                    "value": "apply",
                  },
                },
                "arguments": [
                  {
                    "expression": {
                      span: SPAN,
                      optional: false,
                      "type": "Identifier",
                      "value": "console",
                    },
                  },
                  {
                    "expression": {
                      optional: false,
                      span: SPAN,
                      "type": "Identifier",
                      "value": "arguments",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });
  }
}
function addStdLibImport(indexJsFile: IBundleFileState, name: string) {
  const stdLibImportDeclaration = querySelector<ImportDeclaration>(
    (node): node is ImportDeclaration =>
      node.type === "ImportDeclaration" && node.source.value === STD_LIB_FILE,
    indexJsFile.ast,
  );
  const newImportSpecifier: ImportSpecifier = {
    span: SPAN,
    type: "ImportSpecifier",
    imported: null,
    local: {
      type: "Identifier",
      optional: false,
      span: SPAN,
      value: name,
    },
  };
  if (stdLibImportDeclaration) {
    stdLibImportDeclaration.specifiers.push(newImportSpecifier);
    indexJsFile.importedSymbols.add(name);
    return;
  }
  indexJsFile.ast.body.unshift({
    type: "ImportDeclaration",
    source: {
      type: "StringLiteral",
      hasEscape: false,
      span: SPAN,
      value: STD_LIB_FILE_WITHOUT_EXTENSION,
    },
    span: SPAN,
    specifiers: [newImportSpecifier],
  });
  indexJsFile.importedSymbols.add(name);
}