// deno-lint-ignore-file no-explicit-any
import { IPlaceholderList } from "../compile/IPlaceholderList.ts";
import { TNode } from "./TNode.ts";

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

function isPlaceholderList(value: any): value is IPlaceholderList {
  return value?.type === "PlaceholderList";
}

export function forEachNode(
  rootNode: TNode | IPlaceholderList,
  cb: (node: TNode) => true | void,
): void {
  const nodes: TNode[] = [rootNode];
  const visited = new Set();
  while (nodes.length > 0) {
    const node = nodes.pop()!;
    if (visited.has(node)) return;
    visited.add(node);
    const shouldStop = cb(node);

    if (shouldStop === true) {
      break;
    }
    if (isPlaceholderList(node)) {
      continue;
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
      for (let i = node.stmts.length - 1; i >= 0; i--) {
        nodes.push(node.stmts[i]);
      }
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
    if (node.type === "ArrayExpression") {
      for (const n of node.elements) {
        if (!n) continue;
        nodes.push(n.expression);
      }
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
    if (node.type === "ReturnStatement") {
      nodes.push(node.argument);
      continue;
    }
    if (node.type === "IfStatement") {
      if (node.alternate) {
        nodes.push(node.alternate);
      }
      if (node.consequent) {
        nodes.push(node.consequent);
      }
      nodes.push(node.test);
      continue;
    }
    if (node.type === "NullLiteral") {
      continue;
    }
    if (node.type === "NewExpression") {
      nodes.push(...node.arguments.map((arg) => arg.expression));
      nodes.push(node.callee);
      continue;
    }
    if (node.type === "FunctionExpression") {
      nodes.push(node.body);
      nodes.push(...node.params);
      nodes.push(node.identifier);
      continue;
    }
    if (node.type === "ThrowStatement") {
      nodes.push(node.argument);
      continue;
    }
    if (node.type === "Computed") {
      nodes.push(node.expression);
      continue;
    }
    if (node.type === "StringLiteral") continue;
    if (node.type === "NumericLiteral") continue;
    if (node.type === "ExportDefaultDeclaration") {
      nodes.push(node.decl);
      continue;
    }
    if (node.type === "VariableDeclaration") {
      nodes.push(...node.declarations);
      continue;
    }
    if (node.type === "VariableDeclarator") {
      if (node.init) nodes.push(node.init);
      nodes.push(node.id);
      continue;
    }

    throw new Error("Not handled node type: " + node.type);
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
