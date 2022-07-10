interface ISymbolLexem {
  type: "symbol";
  value: string;
}

interface ICommentLexem {
  type: "comment";
  value: string;
}

interface INewLineLexem {
  type: 'newline'
}

export type TLexem =
  | "("
  | ")"
  | " "
  | INewLineLexem
  | number
  | bigint
  | ISymbolLexem
  | ICommentLexem;
