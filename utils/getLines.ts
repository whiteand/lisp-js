export function getLines(text: string, maxLineLength: number): string[] {
  const lines = [];
  const initialLines = text.split("\n");
  for (const line of initialLines) {
    if (line.length <= maxLineLength) {
      lines.push(line);
      continue;
    }
    const words = line.split(/\s+/);
    let currentLine = "";
    for (const word of words) {
      if (currentLine.length + word.length + 1 > maxLineLength) {
        lines.push(currentLine);
        currentLine = word;
        continue;
      }
      currentLine += " " + word;
    }
    if (currentLine.trim()) {
      lines.push(currentLine);
    }
  }
  return lines;
}
