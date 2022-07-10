import { IList, LispExpression } from "./ast.ts";
import { LispSyntaxError } from "./LispSyntaxError.ts";
import { renderLocation } from "./renderLocation.ts";

export interface ITree<T> {
  readonly parent: T | null;
  readonly children: T[];
}

export interface IDefinitionTree {
  readonly symbols: Record<string, TDefinition>;
  readonly children: IDefinitionTree[];
}

export interface IScope extends ITree<IScope> {
  getDefinition(symbol: string): TDefinition | null;
  getDefinitions(): Record<string, TDefinition>;
  forceDefine(symbol: string, definition: TDefinition): void;
  define(
    symbol: string,
    definition: TDefinition,
    declaration: LispExpression,
  ): void;

  createChild(): IScope;
}

interface InjectedFromStdLib {
  definitionType: "injected_stdlib_function";
}

interface IExpressionDefinition {
  definitionType: "ExpressionDefinition";
  expression: LispExpression;
}

interface DefaultFunctionNameDefinition {
  definitionType: "DefaultFunctionName";
}

interface IConstDefinition {
  definitionType: "Const";
  declaration: IList;
  value: LispExpression;
}

export type TDefinition =
  | IExpressionDefinition
  | DefaultFunctionNameDefinition
  | IConstDefinition
  | InjectedFromStdLib;

export class Scope implements IScope {
  public readonly parent: IScope | null;
  private readonly definitionBySymbolName: Map<string, TDefinition>;
  public readonly children: IScope[];

  constructor(parent: IScope | null) {
    this.parent = parent;
    this.definitionBySymbolName = new Map();
    this.children = [];
  }

  public getDefinition(symbol: string): TDefinition | null {
    const definition = this.definitionBySymbolName.get(symbol);
    if (definition) {
      return definition;
    }
    if (this.parent) {
      return this.parent.getDefinition(symbol);
    }
    return null;
  }

  public getDefinitions(): Record<string, TDefinition> {
    const res = Object.create(null);
    for (const [name, definition] of this.definitionBySymbolName) {
      res[name] = definition;
    }
    if (this.parent) {
      const parentSymbols = this.getDefinitions();
      for (const [name, definition] of Object.entries(parentSymbols)) {
        if (res[name]) continue;
        res[name] = definition;
      }
    }

    return res;
  }

  public forceDefine(name: string, definition: TDefinition): void {
    this.definitionBySymbolName.set(name, definition);
  }

  public define(
    name: string,
    definition: TDefinition,
    declaration: LispExpression,
  ): void {
    const previousDefinition = this.definitionBySymbolName.get(name);
    if (!previousDefinition) {
      this.forceDefine(name, definition);
      return;
    }
    if (previousDefinition.definitionType === "Const") {
      throw LispSyntaxError.fromExpression(
        `cannot redeclare constant "${name}".\nIt was already defined at ${
          renderLocation(previousDefinition.declaration.start)
        }`,
        declaration,
      );
    }
    this.forceDefine(name, definition);
    this.definitionBySymbolName.set(name, definition);
  }

  public createChild(): Scope {
    const child = new Scope(this);
    this.children.push(child);
    return child;
  }

  public toString(): string {
    const defs = this.getDefinitions();
    return JSON.stringify(defs);
  }
}
