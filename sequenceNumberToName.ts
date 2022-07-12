const ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";

export function sequenceNumberToName(sequenceNumber: number): string {
  if (sequenceNumber < 0) {
    return sequenceNumberToName(-sequenceNumber) + "_";
  }
  if (sequenceNumber <= 0) {
    return "_";
  }
  let num = sequenceNumber;
  let res = "";
  const base = ALPHABET.length;
  while (num > 0) {
    const index = num % base;
    res = ALPHABET[index] + res;
    num = (num - index) / base;
  }
  return res;
}
