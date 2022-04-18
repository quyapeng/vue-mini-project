export function transform(root, options) {
  const context = createTransformContext(root, options);
  traverseNode(root, context);
}

function createTransformContext(root: any, { nodeTransforms = [] }: any): any {
  return {
    root,
    nodeTransforms,
  };
}

function traverseNode(node: any, { nodeTransforms }) {
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
