import { LispExpression } from "../ast.ts";
import { swcType } from "../deps.ts";
import { IScope, TDefinition } from "../Scope.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";
import { IStatementList } from "./IStatementList.ts";
import { IPlaceholderList } from "./IPlaceholderList.ts";
import { invariant } from "../syntaxInvariant.ts";

export class PlaceholderList implements IScope, IStatementList {
  private parentList: IStatementList;
  private scope: IScope;
  private statements: swcType.Statement[];
  private _expr: LispExpression;
  private hoistPos: number;
  private deferred: (() => void)[];
  constructor(
    scope: IScope,
    parent: IStatementList,
    expression: LispExpression,
  ) {
    this.parentList = parent;
    this.scope = scope;
    this.statements = [];
    this._expr = expression;
    this.hoistPos = 0;
    this.deferred = [];
  }
  get expression(): LispExpression {
    return this._expr;
  }
  getDefinition(symbol: string): TDefinition | null {
    return this.scope.getDefinition(symbol);
  }
  getDefinitions(): Record<string, TDefinition> {
    return this.scope.getDefinitions();
  }
  forceDefine(symbol: string, definition: TDefinition): void {
    return this.scope.forceDefine(symbol, definition);
  }
  define(
    symbol: string,
    definition: TDefinition,
    declaration: LispExpression,
  ): void {
    return this.scope.define(symbol, definition, declaration);
  }
  createChild(): IScope {
    return this.scope.createChild();
  }
  removeChild(child: IScope): boolean {
    return this.scope.removeChild(child);
  }
  defineRandom(definition: TDefinition): string {
    return this.scope.defineRandom(definition);
  }
  getSequenceNumber(): number {
    return this.scope.getSequenceNumber();
  }
  getReferences(symbol: string): LispExpression[] {
    return this.scope.getReferences(symbol);
  }
  tryAddReference(symbol: string, expression: LispExpression): boolean {
    return this.scope.tryAddReference(symbol, expression);
  }
  get parent(): IScope | null {
    return this.scope.parent;
  }
  get children(): IScope[] {
    return this.scope.children;
  }
  append(statement: swcType.Statement): void {
    this.statements.push(statement);
  }
  appendPlaceholder(expression: LispExpression): IPlaceholderList {
    const placeholder = new PlaceholderList(this.scope, this, expression);
    // deno-lint-ignore no-explicit-any
    this.append(placeholder as any);
    return placeholder;
  }
  replace(
    statement: swcType.Statement,
    newStatement: swcType.Statement[],
  ): void {
    const ind = this.statements.indexOf(statement);
    if (ind < 0) return;
    this.statements.splice(ind, 1, ...newStatement);
  }
  hoist(statement: swcType.Statement): void {
    this.statements.splice(this.hoistPos++, 0, statement);
  }
  defer(cb: () => void): void {
    this.deferred.push(cb);
  }
  close(): void {
    this.callDeferred();
    this.invariantPlaceholderRemoved();
    this.commit();
  }
  private commit(): void {
    this.parentList.replace(this as any, this.statements);
  }
  private callDeferred(): void {
    while (this.deferred.length > 0) {
      const cb = this.deferred.pop();
      if (!cb) continue;
      cb();
    }
  }
  invariantPlaceholderRemoved(): void {
    for (const st of this.statements) {
      if (!(st instanceof PlaceholderList)) continue;
      invariant(false, "Placeholder was not removed", st.expression);
    }
  }
}

export class BlockStatementList implements IBlockStatementList {
  private scope: IScope;
  private blockStatement: swcType.BlockStatement;
  private hoistPosition: number;
  private deferred: (() => void)[];
  constructor(scope: IScope, blockStatement: swcType.BlockStatement) {
    this.scope = scope;
    this.blockStatement = blockStatement;
    this.hoistPosition = 0;
    this.deferred = [];
  }
  replace(
    statement: swcType.Statement,
    newStatements: swcType.Statement[],
  ): void {
    const ind = this.blockStatement.stmts.indexOf(statement);
    if (ind < 0) return;
    this.blockStatement.stmts.splice(ind, 1, ...newStatements);
  }
  appendPlaceholder(expression: LispExpression): IPlaceholderList {
    const placeholder = new PlaceholderList(this.scope, this, expression);
    this.append(placeholder as any);
    return placeholder;
  }
  defer(cb: () => void) {
    this.deferred.push(cb);
  }
  private callDeferred() {
    while (this.deferred.length > 0) {
      const cb = this.deferred.pop();
      if (!cb) continue;
      cb();
    }
  }
  close() {
    this.callDeferred();
    this.invariantPlaceholderRemoved();
  }
  private invariantPlaceholderRemoved(): void {
    for (let i = 0; i < this.blockStatement.stmts.length; i++) {
      const st = this.blockStatement.stmts[i];
      if (!st) continue;
      if (st instanceof PlaceholderList) {
        invariant(false, "All placholders should be removed.", st.expression);
      }
    }
  }
  getDefinition(symbol: string): TDefinition | null {
    return this.scope.getDefinition(symbol);
  }
  tryAddReference(symbol: string, expression: LispExpression): boolean {
    return this.scope.tryAddReference(symbol, expression);
  }
  getDefinitions(): Record<string, TDefinition> {
    return this.scope.getDefinitions();
  }
  forceDefine(symbol: string, definition: TDefinition): void {
    return this.scope.forceDefine(symbol, definition);
  }
  define(
    symbol: string,
    definition: TDefinition,
    declaration: LispExpression,
  ): void {
    return this.scope.define(symbol, definition, declaration);
  }
  createChild(): IScope {
    return this.scope.createChild();
  }
  removeChild(child: IScope): boolean {
    return this.scope.removeChild(child);
  }
  defineRandom(definition: TDefinition): string {
    return this.scope.defineRandom(definition);
  }
  getSequenceNumber(): number {
    return this.scope.getSequenceNumber();
  }
  get parent(): IScope | null {
    return this.scope.parent;
  }
  get children(): IScope[] {
    return this.scope.children;
  }
  getReferences(symbol: string): LispExpression[] {
    return this.scope.getReferences(symbol);
  }
  append(statement: swcType.Statement): void {
    this.blockStatement.stmts.push(statement);
  }
  hoist(statement: swcType.Statement): void {
    this.blockStatement.stmts.splice(this.hoistPosition, 0, statement);
    this.hoistPosition++;
  }
}
