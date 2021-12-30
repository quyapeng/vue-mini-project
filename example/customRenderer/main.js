// vue3 composition api
import { createRenderer } from "../../lib/guide-mini-vue.esm.js";
import { App } from "./App.js";
console.log(PIXI);

// 初始化
const game = new PIXI.Application({
  width: 500,
  height: 500,
});
console.log(game.view);
document.body.append(game.view);
const renderer = createRenderer({
  createElement(type) {
    // 矩形
    if (type == "rect") {
      const rect = new PIXI.Graphics();
      // 设置颜色
      rect.beginFill(0xff0000);
      // 绘制
      rect.drawRect(0, 0, 100, 100);
      // 结束绘制
      rect.endFill();
      return rect;
    }
  },
  patchProp(el, key, val) {
    //
    el[key] = val;
  },
  insert(el, parent) {
    // 类似 dom 中append
    parent.addChild(el);
  },
});
// pixi中stage是根容器
renderer.createApp(App).mount(game.stage);

// const rootContainer = document.querySelector("#app");
// createApp(App).mount(rootContainer);
