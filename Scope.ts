import { IList, ISymbol, LispExpression } from "./ast.ts";
import { LispSyntaxError } from "./LispSyntaxError.ts";
import { renderLocation } from "./renderLocation.ts";
import { sequenceNumberToName } from "./sequenceNumberToName.ts";
import { invariant } from "./syntaxInvariant.ts";

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
  removeChild(child: IScope): boolean;
  defineRandom(definition: TDefinition): string;
  getSequenceNumber(): number;
  getReferences(symbol: string): LispExpression[];
  tryAddReference(symbol: string, expression: LispExpression): boolean;
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
interface IParameterDefinition {
  definitionType: "FunctionParameter";
  symbol: ISymbol;
}

interface IAnonymousFunctionDefinition {
  definitionType: "AnonymousFunction";
  value: ISymbol;
  minParametersNumber: number;
}

export type TDefinition =
  | IExpressionDefinition
  | IParameterDefinition
  | IAnonymousFunctionDefinition
  | DefaultFunctionNameDefinition
  | IConstDefinition
  | InjectedFromStdLib;

export class Scope implements IScope {
  public readonly parent: IScope | null;
  private readonly definitionBySymbolName: Map<string, TDefinition>;
  public readonly children: IScope[];
  private sequenceNumber: number;
  private readonly usedSymbols: Map<string, Set<LispExpression>> = new Map();

  constructor(parent: IScope | null) {
    this.sequenceNumber = 0;
    this.parent = parent;
    this.definitionBySymbolName = new Map();
    this.children = [];
  }

  getReferences(symbol: string): LispExpression[] {
    const res: LispExpression[] = [];

    const references = this.usedSymbols.get(symbol);
    if (references) {
      for (const reference of references) {
        res.push(reference);
      }
    }
    for (const child of this.children) {
      res.push(...child.getReferences(symbol));
    }
    return res;
  }

  tryAddReference(symbol: string, expression: LispExpression): boolean {
    const def = this.definitionBySymbolName.get(symbol);
    if (def) {
      const references = this.usedSymbols.get(symbol);
      if (references) {
        references.add(expression);
        return true;
      }
      this.usedSymbols.set(symbol, new Set([expression]));
      return true;
    }
    if (this.parent) {
      return this.parent.tryAddReference(symbol, expression);
    }
    return false;
  }

  public removeChild(child: IScope): boolean {
    const ind = this.children.indexOf(child);
    if (ind < 0) return false;
    this.children.splice(ind, 1);
    return true;
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
    if (previousDefinition.definitionType === "injected_stdlib_function") {
      throw LispSyntaxError.fromExpression(
        `"${name}" is name reserved for std library.`,
        declaration,
      );
    }
    if (previousDefinition.definitionType === "DefaultFunctionName") {
      throw LispSyntaxError.fromExpression(
        `"${name}" is reserved for the module export default function.`,
        declaration,
      );
    }
    if (previousDefinition.definitionType === "ExpressionDefinition") {
      throw LispSyntaxError.fromExpression(
        `cannot redeclare "${name}".\nIt was already defined at ${
          renderLocation(previousDefinition.expression.start)
        }`,
        declaration,
      );
    }
    if (previousDefinition.definitionType === "AnonymousFunction") {
      previousDefinition.value.name = this.defineRandom(previousDefinition);
      return;
    }
    invariant(false, "Unexpected redeclaration", declaration);
  }

  defineRandom(definition: TDefinition): string {
    const parentSequenceNumber = this.parent
      ? this.parent.getSequenceNumber()
      : 0;
    let sequenceNumber = Math.max(
      parentSequenceNumber,
      this.sequenceNumber,
    );
    while (true) {
      const name = sequenceNumberToName(sequenceNumber++);
      const def = this.getDefinition(name);
      if (def) continue;
      this.forceDefine(name, definition);
      this.sequenceNumber = sequenceNumber;
      return name;
    }
  }

  getSequenceNumber() {
    return this.sequenceNumber;
  }

  public createChild(): IScope {
    const child = new Scope(this);
    this.children.push(child);
    return child;
  }

  public toString(): string {
    const defs = this.getDefinitions();
    return JSON.stringify(defs);
  }
}
