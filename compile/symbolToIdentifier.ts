export function symbolToId(symbol: string): string {
  return symbol.replaceAll("-", "$_$").replaceAll('?', '$Q$');
}
