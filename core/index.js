import { effectWatch } from "./reactivity/index.js";
import { mountElement } from "./renderer/index.js";

// 通用
export function createApp(rootComponent) {
  return {
    mount(rootContainer) {
      const context = rootComponent.setup();
      let isMounted = false;
      let prevSubTree;
      effectWatch(() => {
        if (!isMounted) {
          // init
          isMounted = true;
          rootContainer.innerHTML = "";
          const subTree = rootComponent.render(context);
          console.log(subTree);
          mountElement(subTree, rootContainer);
          prevSubTree = subTree;
        } else {
          // update
          const subTree = rootComponent.render(context);
          diff(prevSubTree, subTree);
          prevSubTree = subTree;
        }

        // rootContainer.append(subTree);
        // diff
        // newVnode, oldVnode
      });
    },
  };
}
