export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  push("return ");

  const FunctionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  push(`function ${FunctionName}(${signature}){`);
  push("return ");
  genNode(ast.codegenNode, context);
  push("}");
  //   code += `function ${FunctionName}(${signature}){`;
  //   // 介于灵活考虑，这一部分放在transform中处理好之后再返回，此处直接使用。
  //   //   console.log("ast", ast);
  //   //   const node = ast.children[0];
  //   const node = ast.codegenNode;
  //   code += `return '${node.content}'`;
  //   code += "}";

  return {
    code: context.code,
  };
}
function genNode(node: any, context) {
  // const node = ast.codegenNode;
  //   code += `return '${node.content}'`;
  const { push } = context;
  push(`'${node.content}'`);
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
  };
  return context;
}
