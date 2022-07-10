// deno-lint-ignore-file
// deno-lint-ignore-file require-await
import * as colors from "https://deno.land/std@0.147.0/fmt/colors.ts";

// swc
import { parse, print } from "https://deno.land/x/swc@0.2.0/mod.ts";

const swc = {
  print: async (pr: unknown, opts: any) => {
    return print(pr, opts);
  },
  parse: async (code: string, opts: any) => {
    return parse(code, opts);
  },
};

export { colors, swc };
