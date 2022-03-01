import { NodeTypes } from "./../src/ast";
import { baseParse } from "../src/parse";
describe("Parse", () => {
  describe("interpolation", () => {
    // 插值
    test("simple interpolation", () => {
      // 简单插值
      const ast = baseParse("{{message}}");
      // 验证当前ast是根结点,有children，插值节点位置在children[0]？？
      // toStrictEqual测试对象是否具有相同的类型和结构
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: "message",
        },
      });
    });
  });
  /** element **/
  describe("element", () => {
    it("simple element", () => {
      // element
      const ast = baseParse("<div></div>");
      // 验证当前ast是根结点,有children，插值节点位置在children[0]？？
      // toStrictEqual测试对象是否具有相同的类型和结构
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        children: [],
        // 解析-正则 以<开始，第二位是字母
        // 解析之后
      });
    });
  });

  // text
  /**
   * 命中非插值，也不是element的，就默认他是text。
   * ***/
  describe("text", () => {
    it("simple text", () => {
      // text
      const ast = baseParse("this is text");
      // 验证当前ast是根结点,有children，插值节点位置在children[0]？？
      // toStrictEqual测试对象是否具有相同的类型和结构
      expect(ast.children[0]).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "this is text",
      });
    });
  });

  test("hello world", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");

    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  // 多加一层
  test("Nested element ", () => {
    const ast = baseParse("<div><p>hi</p>{{message}}</div>");
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi",
            },
          ],
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "message",
          },
        },
      ],
    });
  });

  // 内有单个标签，无闭合标签时，给出标签名称的提示
  test.only("should throw error when miss end tag", () => {
    expect(() => {
      baseParse("<div><span></div>");
    }).toThrow(`缺少结束标签：span`);
  });
});
