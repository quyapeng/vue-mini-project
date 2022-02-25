import { NodeTypes } from "./ast";
const openDelimiter = "{{";
const closeDelimiter = "}}";

const enum TagType {
  Start,
  End,
}

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
  let s = context.source;
  if (s.startsWith(openDelimiter)) {
    node = parseInterpolation(context);
  } else if (s[0] == "<") {
    // < 开始
    if (/[a-z]/i.test(s[1])) {
      // 第二位是字母，不限制大小
      console.log("element div", s);
      node = parseElement(context);
    }
  }

  //
  if (!node) {
    node = parseText(context);
  }
  nodes.push(node);
  return nodes;
}

function parseTag(context, type) {
  // 1.解析 div
  // 2.删除解析过的node
  const match: any = /^<\/?([a-zA-Z]*)/i.exec(context.source);
  console.log("match", match);
  const tag = match[1];
  //  match 为 [ '<div', 'div', index: 0, input: '<div></div>', groups: undefined ]
  // 正则匹配出的第一位是'<div',最后一位'>'也需要
  /*
  源码此处是分两步处理 我喜欢一次搞定。
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  **/
  advanceBy(context, match[0].length + 1);

  console.log(context.source);
  if (type == TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}

function parseTextData(context, length) {
  const content = context.source.slice(0, length);
  console.log("parseText", context.source);
  // 推进， 截取掉
  advanceBy(context, length);
  return content;
}
function parseText(context) {
  // 1. 获取到值，
  // const content = context.source.slice(0, context.source.length);
  // console.log("parseText", context.source);
  // // 2. 推进， 截取掉
  // advanceBy(context, content.length);
  // console.log("parseText 为空", context.source);
  const content = parseTextData(context, context.source.length);
  // console.log("parseText 为空", context.source);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}

function parseElement(context) {
  // 1.解析 div
  // 2.删除解析过的node
  const element = parseTag(context, TagType.Start);
  parseTag(context, TagType.End);
  console.log("parseElement", context.source);
  return element;
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

  // const rawContent = context.source.slice(0, rawContentLength);
  const rawContent = parseTextData(context, rawContentLength);
  const content = rawContent.trim();

  advanceBy(context, closeDelimiter.length);
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
