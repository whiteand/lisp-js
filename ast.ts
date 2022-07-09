export type LispProgram = LispExpression[];
export type LispExpression =
  | IFunctionCall
  | ISymbol
  | INumber
  | IVectorExpression;

export interface IVectorExpression {
  nodeType: "Vector";
  elements: LispExpression[];
}

export interface IFunctionCall {
  nodeType: "FunctionCall";
  function: LispExpression;
  arguments: LispExpression[];
}
export interface ISymbol {
  nodeType: "Symbol";
  name: string;
}
export interface INumber {
  nodeType: "Number";
  value: number;
}
