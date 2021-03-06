import { ILocationRange } from "./ILocationRange.ts";

export type LispProgram = LispExpression[];
export type LispExpression =
  | IList
  | ISymbol
  | IBigIntNumber
  | INumber
  | IString
  | IVectorExpression
  | IVoidExpression;

export interface IVoidExpression extends ILocationRange {
  nodeType: "Void";
}

export interface IVectorExpression extends ILocationRange {
  nodeType: "Vector";
  elements: LispExpression[];
}
export interface IBooleanExpression extends ILocationRange {
  nodeType: "Boolean";
  value: boolean;
}

export interface IList extends ILocationRange {
  nodeType: "List";
  elements: LispExpression[];
}
export interface ISymbol extends ILocationRange {
  nodeType: "Symbol";
  name: string;
  member: boolean;
}
export interface IString extends ILocationRange {
  nodeType: "String";
  value: string;
  hasEscape: boolean;
}
export interface INumber extends ILocationRange {
  nodeType: "Number";
  value: number;
}

export interface IBigIntNumber extends ILocationRange {
  nodeType: "BigInt";
  value: bigint;
}
