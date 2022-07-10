import { ColorsContext } from "../contexts/colors.ts";

export function formatStack(
  stack: string | undefined,
): string | undefined {
  const colors = ColorsContext.getValue();
  if (!stack) {
    return stack;
  }
  const ind = stack.indexOf(" at ");
  if (ind < 0) {
    return stack;
  }
  const positions = stack.slice(ind).trim().split("\n").map((line) =>
    line.trim()
  );
  const resPos: [string, string][] = [];
  const regex = /^at\s+([\w\._\$]+)\s+\((file:.*)\)$/;
  for (const pos of positions) {
    const m = regex.exec(pos);
    if (!m) {
      continue;
    }
    resPos.push([m[1], m[2]]);
  }
  if (resPos.length <= 0) {
    return stack;
  }

  let commonPath = resPos[0][1];
  for (let i = 0; i < resPos.length; i++) {
    const path = resPos[i][1];
    commonPath = getCommonPrefix(commonPath, path);
  }
  if (commonPath.length > 0) {
    for (let i = 0; i < resPos.length; i++) {
      resPos[i][1] = resPos[i][1].slice(commonPath.length);
    }
  }
  return resPos.map((pos) =>
    ` @ ${colors.yellow(pos[0])} ${colors.gray(pos[1])}`
  ).join("\n");
}
function getCommonPrefix(str1: string, str2: string) {
  let i = 0;
  while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
    i++;
  }
  return str1.slice(0, i);
}
