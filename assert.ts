export function assert<T>(condition: T, message: string): asserts condition {
  if (condition) return;
  throw new Error(message);
}
