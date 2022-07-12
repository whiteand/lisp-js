import { Scope } from "./Scope.ts";
import { asserts } from "./devdeps.ts";

Deno.test("first id is _", () => {
  const global = new Scope(null);
  asserts.assertStrictEquals(
    "_",
    global.defineRandom({ definitionType: "injected_stdlib_function" }),
  );
});
Deno.test("second id is a", () => {
  const global = new Scope(null);
  global.defineRandom({ definitionType: "injected_stdlib_function" });
  asserts.assertStrictEquals(
    "a",
    global.defineRandom({ definitionType: "injected_stdlib_function" }),
  );
});
Deno.test("child gets returns b", () => {
  const global = new Scope(null);
  global.defineRandom({ definitionType: "injected_stdlib_function" });
  global.defineRandom({ definitionType: "injected_stdlib_function" });
  const child = global.createChild();
  asserts.assertStrictEquals(
    "b",
    child.defineRandom({ definitionType: "injected_stdlib_function" }),
  );
});
Deno.test("second child returns b gets returns b", () => {
  const global = new Scope(null);
  global.defineRandom({ definitionType: "injected_stdlib_function" });
  global.defineRandom({ definitionType: "injected_stdlib_function" });
  const child = global.createChild();
  child.defineRandom({ definitionType: "injected_stdlib_function" })
  const child2 = global.createChild();
  asserts.assertStrictEquals(
    "b",
    child2.defineRandom({ definitionType: "injected_stdlib_function" }),
  );
});
