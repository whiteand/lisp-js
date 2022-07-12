// deno-lint-ignore-file
// deno-lint-ignore-file require-await
import * as colors from "https://deno.land/std@0.147.0/fmt/colors.ts";
import * as swcType from "https://esm.sh/@swc/core@1.2.212/types.d.ts";

// swc
import { parse, print } from "https://deno.land/x/swc@0.2.1/mod.ts";

export { colors, parse, print, swcType };
