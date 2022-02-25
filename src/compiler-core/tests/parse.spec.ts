import { baseParse } from "../src/parse";
import { NodeTypes } from "../src/ast";
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
});
describe("element", () => {
  it("simple element", () => {
    // element
    const ast = baseParse("<div></div>");
    // 验证当前ast是根结点,有children，插值节点位置在children[0]？？
    // toStrictEqual测试对象是否具有相同的类型和结构
    expect(ast.children[0]).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
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

// <div>hi, {{ message }}!</div>
