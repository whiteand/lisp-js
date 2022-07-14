import { swcType } from "../deps.ts";
import { querySelector } from "../js-ast/traverse.ts";
import { SPAN } from "./constants.ts";
import { STD_LIB_PATH } from "./STD_LIB_PATH.ts";

export function appendImportStdDeclaration(
  program: swcType.Module,
): swcType.ImportDeclaration {
  const importDeclaration = querySelector<swcType.ImportDeclaration>(
    (node): node is swcType.ImportDeclaration =>
      node.type === "ImportDeclaration" && node.source.value === STD_LIB_PATH,
    program,
  );
  if (importDeclaration) {
    return importDeclaration;
  }

  const newImportDeclaration: swcType.ImportDeclaration = {
    type: "ImportDeclaration",
    source: {
      hasEscape: false,
      span: SPAN,
      type: "StringLiteral",
      value: STD_LIB_PATH,
    },
    span: SPAN,
    specifiers: [],
  };
  program.body.unshift(newImportDeclaration);

  return newImportDeclaration;
}
