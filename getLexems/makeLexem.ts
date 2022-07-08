import { ILocation } from "../ILocation.ts";
import { SourceLocation } from "../SourceLocation.ts";
import { ILexem } from "./ILexem.ts";
import { TLexem } from "./TLexem.ts";

export function makeLexem(lexem: TLexem, start: ILocation, end: ILocation): ILexem {
  return {
    lexem,
    start: new SourceLocation(start.source, start.line, start.column),
    end: new SourceLocation(end.source, end.line, end.column),
  };
}
