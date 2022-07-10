import { ILocation } from "./ILocation.ts";
import { renderLocation } from "./renderLocation.ts";

export function renderLocationRange(start: ILocation, end: ILocation): string {
  if (
    start.source !== end.source || start.line !== end.line ||
    start.column !== end.column
  ) {
    return `${renderLocation(start)} - ${renderLocation(end)}`;
  }
  // if(start.line !== end.line) {
  //   return `${start.source}:${start.line}:${start.column}-${end.line}:${end.column}`;
  // }
  // if(start.column !== end.column) {
  //   return `${start.source}:${start.line}:${start.column}-${end.column}`;
  // }
  return renderLocation(start);
}
