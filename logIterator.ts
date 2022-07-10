export function logIterator<T>(
  message: string,
  iter: Iterator<T>,
): Iterator<T> {
  return {
    next() {
      const entry = iter.next();
      if (entry.done) {
        console.log(message, "done");
        return entry;
      }
      console.log(message, entry.value);
      return entry;
    },
  };
}
