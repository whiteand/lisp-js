interface ISymbolLexem {
  type: "symbol";
  value: string;
}

interface ICommentLexem {
  type: "comment";
  value: string;
}

interface IStringLexem {
  type: 'String',
  value: string
  hasEscape: boolean
}

interface INewLineLexem {
  type: 'newline'
}

export type TLexem =
  | "("
  | ")"
  | "]"
  | "["
  | " "
  | INewLineLexem
  | number
  | bigint
  | ISymbolLexem
  | IStringLexem
  | ICommentLexem;
