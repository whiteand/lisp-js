export type TLexem = "(" | ")" | "+" | "*" | " " | number | bigint | {
  type: "identifier";
  value: string;
};
