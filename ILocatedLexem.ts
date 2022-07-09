import { ILocationRange } from "./ILocationRange.ts";
import { TLexem } from "./TLexem.ts";

export interface ILocatedLexem extends ILocationRange {
  lexem: TLexem;
}
