import { LispExpression } from "../ast.ts";
import { swcType } from "../deps.ts";
import { IScope, TDefinition } from "../Scope.ts";
import { IBlockStatementList } from "./IBlockStatementList.ts";

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
  defer(cb: () => void) {
    this.deferred.push(cb);
  }
  close() {
    while (this.deferred.length > 0) {
      const cb = this.deferred.pop();
      if (!cb) continue;
      cb();
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
