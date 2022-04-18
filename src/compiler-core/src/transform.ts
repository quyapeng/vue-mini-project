import { NodeTypes } from "./ast";

export function transform(root, { nodeTransforms }) {
  const context = createTransformContext(root, { nodeTransforms });
  // 1. 遍历 - 深度优先搜索
  traverseNode(root, context);
  // 2. 修改text content
}
function traverseNode(node: any, { nodeTransforms = [] }: any) {
  //
  // console.log("node", node);
  // if (node.type == NodeTypes.TEXT) {
  //   node.content = node.content + " mini-vue";
  // }
  for (let i = 0; i < nodeTransforms.length; i++) {
    nodeTransforms[i](node);
  }
  const children = node.children;
  if (children) {
    for (let i = 0; i > children.length; i++) {
      const node = children[i];
      traverseNode(node, { nodeTransforms });
    }
  }
}

function createTransformContext(root, { nodeTransforms = [] }) {
  return {
    root,
    nodeTransforms,
  };
}
