import { ILocation } from "./ILocation.ts";
import { TLexem } from "./TLexem.ts";

export interface ILocatedLexem {
  lexem: TLexem;
  start: ILocation;
  end: ILocation;
}
