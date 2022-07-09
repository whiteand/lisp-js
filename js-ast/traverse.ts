import { TNode } from "./swc.ts";

export function getNodeByType<T extends TNode["type"]>(
  type: T,
  node: TNode,
): Extract<TNode, { type: T }> | null {
  return querySelector(
    (node): node is Extract<TNode, { type: T }> => node.type === type,
    node,
  ) as any;
}

export function getNodesByType<T extends TNode["type"]>(
  type: T,
  node: TNode,
): Extract<TNode, { type: T }>[] {
  return querySelectorAll(
    (node): node is Extract<TNode, { type: T }> => node.type === type,
    node,
  ) as any;
}

export function forEachNode(
  rootNode: TNode,
  cb: (node: TNode) => true | void,
): void {
  let nodes: TNode[] = [rootNode];
  while (nodes.length > 0) {
    const node = nodes.pop()!;
    const shouldStop = cb(node);

    if (shouldStop === true) {
      break;
    }

    if (node.type === "Module") {
      nodes.push(...node.body);
      continue;
    }
    if (node.type === "ExportDeclaration") {
      nodes.push(node.declaration);
      continue;
    }
    if (node.type === "Identifier") continue;
    if (node.type === "CallExpression") {
      nodes.push(...node.arguments.map((e) => e.expression));
      nodes.push(node.callee);
      continue;
    }
    if (node.type === "FunctionDeclaration") {
      nodes.push(node.body);
      nodes.push(...node.params);
      nodes.push(node.identifier);
      continue;
    }
    if (node.type === "BlockStatement") {
      nodes.push(...node.stmts);
      continue;
    }
    if (node.type === "MemberExpression") {
      nodes.push(node.property);
      nodes.push(node.object);
      continue;
    }
    if (node.type === "Parameter") {
      nodes.push(node.pat);
      continue;
    }
    if (node.type === "BinaryExpression") {
      nodes.push(node.right);
      nodes.push(node.left);
      continue;
    }
    if (node.type === "ExpressionStatement") {
      nodes.push(node.expression);
      continue;
    }

    if (node.type === "ImportDeclaration") {
      nodes.push(node.source);
      nodes.push(...node.specifiers);
      continue;
    }

    if (node.type === "ImportSpecifier") {
      if (node.imported) {
        nodes.push(node.imported);
      }
      nodes.push(node.local);
      continue;
    }
    if (node.type === "StringLiteral") continue;
    if (node.type === "NumericLiteral") continue;

    throw new Error("Not handled node type: " + JSON.stringify(node));
  }
}

export function querySelector(
  pred: (node: TNode) => boolean,
  node: TNode,
): TNode | null;
export function querySelector<T extends TNode>(
  pred: (node: TNode) => node is T,
  node: TNode,
): T | null;
export function querySelector<T>(
  pred: any,
  node: TNode,
): TNode | null {
  let res: TNode | null = null;
  forEachNode(node, (n) => {
    if (pred(n)) {
      res = n;
      return true;
    }
  });
  return res;
}

export function querySelectorAll(
  pred: (node: TNode) => boolean,
  node: TNode,
): TNode[] {
  const res: TNode[] = [];
  forEachNode(node, (n) => {
    if (pred(n)) {
      res.push(n);
    }
  });
  return res;
}