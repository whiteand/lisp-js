import { IScope } from "../Scope.ts";
import { IStatementList } from "./IStatementList.ts";

export interface IBlockStatementList extends IScope, IStatementList {}
