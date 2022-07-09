import { ILocation } from "./ILocation.ts";

export function renderLocation(loc: ILocation) {
  return `${loc.source}:${loc.line}:${loc.column}`;
}
