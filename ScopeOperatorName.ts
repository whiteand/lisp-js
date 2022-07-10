export type ScopeOperatorName = "const";

export function isScopeOperatorName(name: string): name is ScopeOperatorName {
  return name === "const";
}
