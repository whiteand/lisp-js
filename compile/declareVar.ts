import { swcType } from "../deps.ts";
import { SPAN } from "./constants.ts";

export function declareVar(
  kind: 'const' | 'let',
  id: swcType.Identifier,
  init: swcType.Expression | null,
): swcType.VariableDeclaration {
  return {
    type: "VariableDeclaration",
    span: SPAN,
    kind,
    declare: false,
    declarations: [
      {
        type: "VariableDeclarator",
        definite: false,
        id,
        span: SPAN,
        init: init || undefined,
      },
    ],
  };
}
