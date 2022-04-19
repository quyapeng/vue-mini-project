export function transform(root, options = {}) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);

  // 处理codegen root.codegenNode
  createRootCodegen(root);
}
function createRootCodegen(root: any) {
  root.codegenNode = root.children[0];
}
function createTransformContext(root: any, { nodeTransforms = [] }: any): any {
  return {
    root,
    nodeTransforms,
  };
}

function traverseNode(node: any, { nodeTransforms }) {
  //
  // console.log("node", node); 以下内容为定制化，放在入口处由调用方选择是否使用
  // if (node.type == NodeTypes.TEXT) {
  //   node.content = node.content + " mini-vue";
  // }
  for (let i = 0; i < nodeTransforms.length; i++) {
    const transform = nodeTransforms[i];
    transform(node);
  }

  traverseChildren(node, { nodeTransforms });
}
function traverseChildren({ children }: any, { nodeTransforms }: any) {
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];
      traverseNode(node, { nodeTransforms });
    }
  }
}
