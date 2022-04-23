// mini-vue  出口

export * from "./runtime-dom";

import { baseCompile } from "./compiler-core/src";
import * as runtimeDom from "./runtime-dom";
import { registerRuntimeCompiler } from "./runtime-dom";

// {code}

function compilerToFunction(template) {
  const { code } = baseCompile(template);
  const render = new Function("Vue", code)(runtimeDom);
  return render;
  // code 为编译出来的
  //   "const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = Vue;
  // return function render(_ctx, _cache){return _createElementVNode(\\"\\"div\\"\\"), undefined,\\"div\\",null,'hi, '+_toDisplayString(_ctx.message))}"
  // `;
}

registerRuntimeCompiler(compilerToFunction);
