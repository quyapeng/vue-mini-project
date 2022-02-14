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
        type: "interpolation",
        content: {
          type: "simple_expression",
          content: "message",
        },
      });
    });
  });
});
