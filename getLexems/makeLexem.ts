import { ILocatedLexem } from "../ILocatedLexem.ts";
import { ILocation } from "../ILocation.ts";
import { SourceLocation } from "../SourceLocation.ts";
import { TLexem } from "../TLexem.ts";

function equalLocations(first: ILocation, second: ILocation): boolean {
  return first.source === second.source && first.line === second.line &&
    first.column === second.column;
}

export function makeLexem(
  lexem: TLexem,
  start: ILocation,
  end: ILocation,
): ILocatedLexem {
  const startSourceLocation = new SourceLocation(
    start.source,
    start.line,
    start.column,
  );
  const endSourceLocation = equalLocations(start, end)
    ? startSourceLocation
    : new SourceLocation(end.source, end.line, end.column);
  return {
    lexem,
    start: startSourceLocation,
    end: endSourceLocation,
  };
}
