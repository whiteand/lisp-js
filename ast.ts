import { ILocationRange } from "./ILocationRange.ts";

export type LispProgram = LispExpression[];
export type LispExpression =
  | IList
  | ISymbol
  | IBigIntNumber
  | INumber
  | IVectorExpression
  | IVoidExpression;

export interface IVoidExpression extends ILocationRange {
  nodeType: "Void";
}

export interface IVectorExpression extends ILocationRange {
  nodeType: "Vector";
  elements: LispExpression[];
}

export interface IList extends ILocationRange {
  nodeType: "List";
  elements: LispExpression[];
}
export interface ISymbol extends ILocationRange {
  nodeType: "Symbol";
  name: string;
}
export interface INumber extends ILocationRange {
  nodeType: "Number";
  value: number;
}

export interface IBigIntNumber extends ILocationRange {
  nodeType: "BigInt";
  value: bigint;
}
