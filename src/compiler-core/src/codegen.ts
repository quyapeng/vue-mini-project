import { isString } from "../../shared";
import { NodeTypes } from "./ast";
import {
  CREATE_ELEMENT_VNODE,
  helperMapName,
  TO_DISPLAY_STRING,
} from "./runtimeHelpers";

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
    case NodeTypes.ELEMENT:
      genElement(node, context);
      break;
    case NodeTypes.COMPOUND_EXPRESSION:
      genCompoundExpression(node, context);

    default:
      break;
  }
}

function genCompoundExpression(node: any, context: any) {
  const { push } = context;
  const { children } = node;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (isString(child)) {
      push(child);
    } else {
      genNode(child, context);
    }
  }
}
function genElement({ tag, children, props }: any, context: any) {
  //
  const { push, helper } = context;
  // console.log("children", children);
  push(`${helper(CREATE_ELEMENT_VNODE)}("${tag}"), ${props},`);
  // console.log("llll", genNullable([tag, props, children]));
  genNodeList(genNullable([tag, props, children]), context);
  // const child = children[0];
  // genNode(children, context);
  // for (let i = 0; i < children.length; i++) {
  //   const child = children[i];
  //   genNode(child, context);
  // }
  push(")");
}

function genNodeList(nodes: any, context) {
  // console.log("nodes", nodes);
  const { push } = context;
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    // 如果是string
    if (isString(node)) {
      push(node);
    } else {
      genNode(node, context);
    }
    if (i < nodes.length - 1) push(",");
  }
}

function genNullable(args: any) {
  return args.map((arg) => arg || "null");
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
