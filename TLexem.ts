export type TLexem = "(" | ")" | " " | number | bigint | {
  type: "symbol";
  value: string;
};
