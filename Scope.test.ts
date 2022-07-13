import { Scope } from "./Scope.ts";
import { asserts } from "./devdeps.ts";

Deno.test("first id is _", () => {
  const global = new Scope(null);
  asserts.assertStrictEquals(
    "__auto__",
    global.defineRandom({ definitionType: "imported_std_function" }),
  );
});
Deno.test("second id is a", () => {
  const global = new Scope(null);
  global.defineRandom({ definitionType: "imported_std_function" });
  asserts.assertStrictEquals(
    "__auto_a",
    global.defineRandom({ definitionType: "imported_std_function" }),
  );
});
Deno.test("child gets returns b", () => {
  const global = new Scope(null);
  global.defineRandom({ definitionType: "imported_std_function" });
  global.defineRandom({ definitionType: "imported_std_function" });
  const child = global.createChild();
  asserts.assertStrictEquals(
    "__auto_b",
    child.defineRandom({ definitionType: "imported_std_function" }),
  );
});
Deno.test("second child returns b gets returns b", () => {
  const global = new Scope(null);
  global.defineRandom({ definitionType: "imported_std_function" });
  global.defineRandom({ definitionType: "imported_std_function" });
  const child = global.createChild();
  child.defineRandom({ definitionType: "imported_std_function" });
  const child2 = global.createChild();
  asserts.assertStrictEquals(
    "__auto_b",
    child2.defineRandom({ definitionType: "imported_std_function" }),
  );
});
