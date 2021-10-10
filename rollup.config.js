// rollup 一般用于库打包工具   webpack 一般应用打包工具
// 支持esm 语法

import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    // 1.cjs -> commonjs
    // 2.esm 标准化模块规范
    {
      format: "cjs",
      file: "lib/guide-mini-vue.cjs.js",
    },
    {
      format: "es",
      file: "lib/guide-mini-vue.esm.js",
    },
  ],
  // ts 编译为可识别语法 rollup-plugin-typescript
  plugins: [typescript()],
};
