import { transform } from "../src/transform";
import { baseParse } from "../src/parse";
import { NodeTypes } from "../src/ast";

//
describe("transform", () => {
  //
  it("happy path", () => {
    const ast = baseParse("<div>hi, {{message}}</div>");

    const plugin = (node) => {
      if (node.type == NodeTypes.TEXT) {
        node.content = node.content + " mini-vue";
      }
    };
    // 程序可测试性--执行内容由外部自定义
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const nodeText = ast.children[0].children[0];
    console.log(nodeText);
    expect(nodeText.content).toBe("hi, mini-vue");
  });
});
