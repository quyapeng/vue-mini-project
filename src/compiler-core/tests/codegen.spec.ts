import { baseParse } from "../src/parse";
import { generate } from "../src/codegen";
import { transform } from "../src/transform";
import { transformExpression } from "../src/transforms/transformExpression";

describe("codegen", () => {
  it("happy path string", () => {
    //
    const ast = baseParse("hi");
    transform(ast);
    const { code } = generate(ast);
    // 快照测试-->
    // 1. 抓问题
    // 2. 有意更新（）
    // toMatchSnapshot 会为expect的结果做一个快照，并与前面的快照做匹配。
    // 执行run之后，生成一个__snapshots__文件夹，里面生成一个codegen.spec.ts.snap文件，这就是快照内容。
    // 执行run的命令之后➕ -u 代表有意更新,此时就会更新快照内容，方面下次对比最新数据。

    expect(code).toMatchSnapshot();
  });

  //
  it("interpolation", () => {
    const ast = baseParse("{{message}}");
    transform(ast, {
      nodeTransforms: [transformExpression],
    });
    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });
});
