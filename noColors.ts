import { IColors } from "./IColors.ts";

function identity<T>(s: T): T {
  return s;
}

export const noColors: IColors = {
  blue: identity,
  gray: identity,
  green: identity,
  yellow: identity,
  red: identity,
  brightGreen: identity,
  cyan: identity,
  magenta: identity,
};
