import { NodeTypes } from "../ast";

export function transformText(node) {
  if (node.type === NodeTypes.ELEMENT) {
    // 添加复合类型
    const { children } = node;
    let currentContainer;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (isText(child)) {
        // 是
        for (let j = i + 1; j < children.length; j++) {
          const next = children[j];
          if (isText(next)) {
            if (!currentContainer) {
              currentContainer = children[i] = {
                type: NodeTypes.COMPOUND_EXPRESSION,
                children: [child],
              };
            }
            currentContainer.children.push("+");
            currentContainer.children.push(next);
            children.splice(j, 1);
            j--;
          } else {
            currentContainer = undefined;
            break;
          }
        }
      }
    }
  }

  function isText(node) {
    return (
      node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION
    );
  }
}
