import { createVNodeCall, NodeTypes } from "../ast";

export function transformElement(node: any, context: any) {
  if (node.type === NodeTypes.ELEMENT) {
    return () => {
      // 中间处理层

      // tag
      const vnodeTag = `"${node.tag}"`;
      // props
      let vnodeProps;

      // children
      const { children } = node;
      let vnodeChildren = children[0];

      // const vnodeElement = {
      //   type: NodeTypes.ELEMENT,
      //   tag: `"${tag}"`,
      //   props: vnodeProps,
      //   children: vnodeChildren,
      // };
      node.codegenNode = createVNodeCall(
        context,
        vnodeTag,
        vnodeProps,
        vnodeChildren
      );
    };
  }
}
