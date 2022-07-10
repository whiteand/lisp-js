import { TLexem } from "./TLexem.ts";

export function renderLexem(lexem: TLexem): string {
  if (typeof lexem === "string") {
    return lexem;
  }
  if (typeof lexem === "number") {
    return lexem.toString();
  }
  if (typeof lexem === "bigint") {
    return lexem.toString();
  }
  if (lexem.type === "symbol") {
    return lexem.value;
  }
  if (lexem.type === "comment") {
    return `// ${lexem.value}`;
  }
  if (lexem.type === "newline") {
    return `\n`;
  }
  throw new Error("Not handled lexem: " + JSON.stringify(lexem));
}
