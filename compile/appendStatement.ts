import { assert } from "../assert.ts";
import { ExportDefaultDeclaration, Module, Statement } from "../js-ast/swc.ts";
import { querySelector } from "../js-ast/traverse.ts";
import { DEFAULT_FUNCTION_NAME } from "./constants.ts";

export function appendToMain(ast: Module, jsStatement: Statement): void {
  const main = querySelector<ExportDefaultDeclaration>(
    (node): node is ExportDefaultDeclaration => {
      if (node.type !== "ExportDefaultDeclaration") return false;
      if (node.decl.type !== "FunctionExpression") return false;
      if (node.decl.identifier.value !== DEFAULT_FUNCTION_NAME) return false;
      return true;
    },
    ast,
  );
  assert(main, "There is no main function in the ast");
  assert(!Array.isArray(main.decl.body), "Main function body is not an array");
  assert(
    main.decl.body.type === "BlockStatement",
    "Main function should have body equal to block statement",
  );
  const ind = main.decl.body.stmts.findIndex((node) =>
    node.type === "ReturnStatement"
  );
  if (ind >= 0) {
    main.decl.body.stmts.splice(ind, 0, jsStatement);
  } else {
    main.decl.body.stmts.push(jsStatement);
  }
}
