import { IVoidExpression } from "../ast.ts";
import { SourceLocation } from "../SourceLocation.ts";


export const VOID: IVoidExpression = {
  nodeType: "Void",
  start: new SourceLocation("stdlib", 0, 0),
  end: new SourceLocation("stdlib", 0, 0),
};
