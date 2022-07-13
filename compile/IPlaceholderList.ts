import { LispExpression } from "../ast.ts";
import { IScope } from "../Scope.ts";
import { IStatementList } from "./IStatementList.ts";


export interface IPlaceholderList extends IStatementList, IScope {
  expression: LispExpression;
}
