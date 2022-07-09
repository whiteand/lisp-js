import { ILocation } from "../ILocation.ts";

export type TParseTask =
  | {
    type: "parse_expression";
  }
  | {
    type: "yield_expression";
  }
  | {
    type: "parse_function_expression";
  }
  | {
    type: "parse_function_params";
  }
  | {
    type: "create_function_call_expression";
  }
  | { type: "parse_expressions_list" }
  | { type: "push_expression_list_array"; start: ILocation; end: ILocation }
  | {
    type: "parse_close_parens";
  }
  | {
    type: "append_to_expression_list";
  };
