/**
 * https://github.com/swc-project/swc/blob/main/node-swc/src/types.ts
 */

export type Program = Module;

export type TAstNode =
  | Program
  | Statement
  | Expression
  | Declaration
  | Param
  | ImportSpecifier
  | BlockStatement;
export interface Module {
  type: "Module";
  body: Statement[];
}

export type Statement =
  | IMultilineComment
  | ModuleDeclaration
  | ExpressionStatement;

export type ModuleDeclaration =
  | ImportDeclaration
  | ExportDeclaration;
// | ExportNamedDeclaration
// | ExportDefaultDeclaration
// | ExportDefaultExpression
// | ExportAllDeclaration
// | TsImportEqualsDeclaration
// | TsExportAssignment
// | TsNamespaceExportDeclaration;

export type ImportSpecifier = NamedImportSpecifier;
// | ImportDefaultSpecifier
// | ImportNamespaceSpecifier;

/**
 * e.g. - `import { foo } from 'mod.js'`
 *
 * local = foo, imported = None
 *
 * e.g. `import { foo as bar } from 'mod.js'`
 *
 * local = bar, imported = Some(foo) for
 */
export interface NamedImportSpecifier extends Node {
  type: "ImportSpecifier";
  local: Identifier;
  imported: Identifier | null;
}

export interface ImportDeclaration extends Node {
  type: "ImportDeclaration";

  specifiers: ImportSpecifier[];

  source: StringLiteral;
}

export interface StringLiteral {
  type: "StringLiteral";

  value: string;
  hasEscape: boolean;
}

export interface ExportDeclaration {
  type: "ExportDeclaration";
  declaration: Declaration;
}

export type Declaration = FunctionDeclaration;

export interface Identifier {
  type: "Identifier";

  value: string;
}

export type Pattern = Identifier;
// | ArrayPattern
// | RestElement
// | ObjectPattern
// | AssignmentPattern
// | Invalid
// | Expression;

export interface Param {
  type: "Parameter";
  pat: Pattern;
}

export interface Fn {
  params: Param[];
  body: BlockStatement;
  generator: boolean;
  async: boolean;
}
export interface BlockStatement {
  type: "BlockStatement";

  stmts: Statement[];
}
export interface Node {
  type: string;
}

export interface ExpressionStatement extends Node {
  type: "ExpressionStatement";
  expression: Expression;
}

interface ExpressionBase extends Node {
}

interface MemberExpression extends ExpressionBase {
  type: "MemberExpression";

  object: Expression;

  property: Identifier; // | PrivateName | ComputedPropName;
}

export interface Argument {
  // spread?: Span;
  expression: Expression;
}

export interface CallExpression extends ExpressionBase {
  type: "CallExpression";

  callee: Expression; // | Super | Import;

  arguments: Argument[];
}

export interface NumericLiteral extends Node {
  type: "NumericLiteral";

  value: number;
}

export type Literal =
  | StringLiteral
  // | BooleanLiteral
  // | NullLiteral
  | NumericLiteral;
// | RegExpLiteral
// | JSXText;

export type Expression =
  // | ThisExpression
  // | ArrayExpression
  // | ObjectExpression
  // | FunctionExpression
  // | UnaryExpression
  // | UpdateExpression
  // | BinaryExpression
  // | AssignmentExpression
  | MemberExpression
  // | SuperPropExpression
  // | ConditionalExpression
  | CallExpression
  // | NewExpression
  // | SequenceExpression
  | Identifier
  | Literal;
// | TemplateLiteral
// | TaggedTemplateExpression
// | ArrowFunctionExpression
// | ClassExpression
// | YieldExpression
// | MetaProperty
// | AwaitExpression
// | ParenthesisExpression
// | JSXMemberExpression
// | JSXNamespacedName
// | JSXEmptyExpression
// | JSXElement
// | JSXFragment
// | TsTypeAssertion
// | TsConstAssertion
// | TsNonNullExpression
// | TsAsExpression
// | PrivateName
// | OptionalChainingExpression
// | Invalid;
export interface FunctionDeclaration extends Fn {
  type: "FunctionDeclaration";
  identifier: Identifier;
}

export interface IMultilineComment {
  type: "MultilineComment" | "MultilineDocComment";
  content: string;
}
