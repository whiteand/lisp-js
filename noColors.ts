import { IColors } from "./IColors.ts";

function identity<T>(s: T): T {
  return s;
}

export const noColors: IColors = {
  bgBlack: identity,
  rgb24: identity,
  bgBlue: identity,
  bgBrightBlack: identity,
  bgBrightBlue: identity,
  bgBrightCyan: identity,
  bgBrightGreen: identity,
  bgBrightMagenta: identity,
  bgBrightRed: identity,
  bgBrightWhite: identity,
  bgBrightYellow: identity,
  bgCyan: identity,
  bgGreen: identity,
  bgMagenta: identity,
  bgRed: identity,
  bgWhite: identity,
  bgYellow: identity,
  black: identity,
  blue: identity,
  bold: identity,
  brightBlack: identity,
  brightBlue: identity,
  brightCyan: identity,
  brightGreen: identity,
  brightMagenta: identity,
  brightRed: identity,
  brightWhite: identity,
  brightYellow: identity,
  cyan: identity,
  dim: identity,
  gray: identity,
  green: identity,
  hidden: identity,
  inverse: identity,
  italic: identity,
  magenta: identity,
  red: identity,
  reset: identity,
  strikethrough: identity,
  underline: identity,
  white: identity,
  yellow: identity,
};
