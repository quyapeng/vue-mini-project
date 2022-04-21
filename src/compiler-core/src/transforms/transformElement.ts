import { NodeTypes } from "../ast";
import { CREATE_ELEMENT_VNODE } from "../runtimeHelpers";

export function transformElement(node: any, context: any) {
  if (node.type === NodeTypes.ELEMENT) {
    context.helper(CREATE_ELEMENT_VNODE);
    // 中间处理层

    // tag
    const { tag } = node;
    // props
    let vnodeProps;

    // children
    const { children } = node;
    let vnodeChildren = children[0];

    const vnodeElement = {
      type: NodeTypes.ELEMENT,
      tag,
      props: vnodeProps,
      children: vnodeChildren,
    };
    node.codegenNode = vnodeElement;
  }
}
