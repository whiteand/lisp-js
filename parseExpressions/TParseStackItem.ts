import { LispExpression } from "../ast.ts";
import { ILocation } from "../ILocation.ts";

interface IStackItemExpression {
  stackType: "expression";
  expression: LispExpression;
}
interface IExpressionListArray {
  stackType: "expression_list";
  expressionList: LispExpression[];
  start: ILocation;
}
interface IStackItemLocation {
  stackType: "location";
  location: ILocation;
}

export type TParseStackItem =
  | IStackItemExpression
  | IExpressionListArray
  | IStackItemLocation;
