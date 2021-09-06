import { effectWatch } from "./reactivity/index.js";
import { mountElement } from "./renderer/index.js";

// 通用
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      const context = rootComponent.setup();

      effectWatch(() => {
        rootContainer.innerHTML = "";
        const subTree = rootComponent.render(context);
        console.log(subTree);
        mountElement(subTree, rootContainer);
        // rootContainer.append(subTree);
      });
    },
  };
}
