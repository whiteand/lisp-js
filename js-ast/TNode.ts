import { swcType } from "../deps.ts";

// deno-lint-ignore-file
export type TNode =
  | swcType.Expression
  | swcType.Module
  | swcType.Statement
  | swcType.ModuleItem
  | swcType.Super
  | swcType.MemberExpression
  | swcType.PrivateName
  | swcType.Declaration
  | swcType.ImportDeclaration
  | swcType.ComputedPropName
  | swcType.Pattern
  | swcType.ImportSpecifier
  | swcType.Import
  | swcType.Param;
