import { ILocation } from "../ILocation.ts";

export type TParseTask =
  | {
    type: "parse_expression";
  }
  | {
    type: "parse_program";
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
    type: "create_list_expression";
  }
  | { type: "parse_expressions_list" }
  | { type: "push_expression_list_array"; start: ILocation }
  | {
    type: "parse_close_parens_and_push_location";
  }
  | {
    type: "append_to_expression_list";
  };
