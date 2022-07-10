import { assert } from "../assert.ts";
import { Module, Statement } from "../js-ast/swc.ts";
import { getNodeByType } from "../js-ast/traverse.ts";

export function appendStatement(ast: Module, jsStatement: Statement): void {
  const module = getNodeByType("Module", ast);
  assert(module, "There is no module in the ast");
  module.body.push(jsStatement);
}
