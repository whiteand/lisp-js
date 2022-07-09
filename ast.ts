import { ILocationRange } from "./ILocationRange.ts";

export type LispProgram = LispExpression[];
export type LispExpression =
  | IFunctionCall
  | ISymbol
  | IBigIntNumber
  | INumber
  | IVectorExpression;

export interface IVectorExpression extends ILocationRange {
  nodeType: "Vector";
  elements: LispExpression[];
}

export interface IFunctionCall extends ILocationRange {
  nodeType: "FunctionCall";
  function: LispExpression;
  arguments: LispExpression[];
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
