import { NodeTypes } from "./ast";
import { helperMapName, TO_DISPLAY_STRING } from "./runtimeHelpers";

// 模块职责划分清晰明确
export function generate(ast) {
  const context = createCodegenContext();
  const { push } = context;
  // 导入逻辑抽取
  genFunctionPreamble(ast, context);
  //   const VueBinging = "Vue";
  //   //   const helpers = ["toDisplayString"];
  //   //   const aliasHelpers = (s: any) => `${s}: _${s}`;
  //   const helpers = ["toDisplayString"];
  //   const aliasHelpers = (s: any) => `${s}: _${s}`;
  //   // 插值 render 导入
  //   //   push(`const { ${helpers.map(aliasHelpers)} } = ${VueBinging};`);
  //   push(`const { ${ast.helpers.map(aliasHelpers)} } = ${VueBinging};`);
  //   push("\n");
  //   push("return ");

  const FunctionName = "render";
  const args = ["_ctx", "_cache"];
  const signature = args.join(", ");
  // console.log("ast", ast);

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
function genFunctionPreamble(ast: any, context: any) {
  const { push } = context;
  const VueBinging = "Vue";
  //   const helpers = ["toDisplayString"];
  //   const aliasHelpers = (s: any) => `${s}: _${s}`;
  const aliasHelpers = (s: any) => `${helperMapName[s]}: _${helperMapName[s]}`;
  // 插值 render 导入
  //   push(`const { ${helpers.map(aliasHelpers)} } = ${VueBinging};`);
  if (ast.helpers.length > 0)
    push(
      `const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${VueBinging};`
    );
  push("\n");
  push("return ");
}
function createCodegenContext() {
  const context = {
    code: "",
    push(source) {
      context.code += source;
    },
    helper(key) {
      return `_${helperMapName[key]}`;
    },
  };
  return context;
}

function genNode(node: any, context) {
  switch (node.type) {
    case NodeTypes.TEXT:
      genText(node, context);
      break;
    case NodeTypes.INTERPOLATION:
      genInterpolation(node, context);
      break;
    case NodeTypes.SIMPLE_EXPRESSION:
      genExpression(node, context);
      break;

    default:
      break;
  }
}

function genExpression(node: any, context: any) {
  const { push } = context;
  push(`${node.content}`);
}

function genInterpolation(node: any, context: any) {
  const { push, helper } = context;
  push(`${helper(TO_DISPLAY_STRING)}(`);
  genNode(node.content, context);
  push(")");
}

function genText(node: any, context: any) {
  const { push } = context;
  push(`'${node.content}'`);
}
