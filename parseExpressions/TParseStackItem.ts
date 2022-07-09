import { LispExpression } from "../ast.ts";
import { ILocation } from "../ILocation.ts";

interface IStackItemExpression {
  stackType: "expression";
  expression: LispExpression;
  start: ILocation;
  end: ILocation;
}
interface IExpressionListArray {
  stackType: "expression_list";
  expressionList: LispExpression[];
  start: ILocation;
  end: ILocation;
}

export type TParseStackItem = IStackItemExpression | IExpressionListArray;
