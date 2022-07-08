import { ILocation } from "./ILocation.ts";

export interface ILocatedChar extends ILocation {
  char: string;
}
