import { ISymbol } from "../ast.ts";
import { ControlFlowOperator } from "./ControlFlowOperator.ts";

export function isControlFlowOperator(
  sym: ISymbol): sym is ISymbol & { name: ControlFlowOperator; } {
  if(sym.name === "if") {
    return true;
  }
  if (sym.name === 'for') {
    return true
  }
  return false;
}
