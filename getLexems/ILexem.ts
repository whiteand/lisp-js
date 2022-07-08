import { ILocation } from "../ILocation.ts";
import { TLexem } from "./TLexem.ts";

export interface ILexem {
  lexem: TLexem;
  start: ILocation;
  end: ILocation;
}
