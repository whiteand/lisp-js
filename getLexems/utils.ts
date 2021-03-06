export function isLetter(letter: string) {
  return letter.toLowerCase() !== letter.toUpperCase();
}

export function isDigit(letter: string) {
  switch (letter) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      return true;
  }
  return false;
}

export function isIdStartCharacter(char: string) {
  return isLetter(char) || "._+<>|&*/-!=$".includes(char);
}

export function isIdCharacter(char: string) {
  return isLetter(char) || isDigit(char) || "_$-&!|=><?".includes(char);
}

const SPACE_REGEX = /^\s+$/;
export function isSpace(char: string): boolean {
  return SPACE_REGEX.test(char);
}

export function isReplacableBySpace(char: string): boolean {
  return isSpace(char) || char === ",";
}
