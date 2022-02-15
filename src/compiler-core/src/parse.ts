import { NodeTypes } from "./ast";
const openDelimiter = "{{";
const closeDelimiter = "}}";
function createParserContext(content: string) {
  return {
    source: content,
  };
  //
}

export function baseParse(content: string) {
  //
  // 创建一个全局的上下文对象
  const context = createParserContext(content);

  return createRoot(parseChildren(context));
}
function parseChildren(context) {
  const nodes: any = [];
  let node: any;
  if (context.source.startsWith(openDelimiter)) {
    node = parseInterpolation(context);
  }
  nodes.push(node);
  return nodes;
}

function parseInterpolation(context) {
  // {{message}} 获取到message内容
  // 从index为2开始查找，前面0，1是固定的 {{ ,减少没必要的查询,所以indexof 第二个参数为open的长度
  // 去除前面固定 {{ 的叫法为 推进
  // 最后一个index
  const closeIndex = context?.source.indexOf(
    closeDelimiter,
    openDelimiter.length
  );
  //
  //   context.source = context?.source.substr(0, closeIndex);
  // 先删除掉前面的
  //   context.source = context?.source.slice(openDelimiter.length);
  advanceBy(context, openDelimiter.length);
  // 最终解析出来内容的长度
  const rawContentLength = closeIndex - openDelimiter.length;

  const rawContent = context.source.slice(0, rawContentLength);
  const content = rawContent.trim();

  advanceBy(context, rawContentLength + closeDelimiter.length);
  //   context.source = context.source.slice(
  //     rawContentLength + closeDelimiter.length
  //   );
  console.log("context", context);

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content,
    },
  };
}

function advanceBy(context: any, length: number) {
  context.source = context?.source.slice(length);
}
// 创建根结点
function createRoot(children) {
  return {
    children,
  };
}
