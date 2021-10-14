// component
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
  };

  return component;
}

export function setupComponent(instance) {
  // 初始化
  // initProps()
  // initSlots()

  setupStatefulComponent(instance);
}

function setupStatefulComponent(instance: any) {
  // setup返回值
  const Component = instance.type;
  // ctx
  instance.proxy = new Proxy(
    {},
    {
      get(target, key) {
        // key -> msg
        // setupState
        const { setupState } = instance;
        if (key in setupState) {
          return setupState[key];
        }
      },
    }
  );

  const { setup } = Component;

  if (setup) {
    // function -> 组件的render函数 or object->将object注入当前组件上下文中
    const setupResult = setup();
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // function or object

  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  console.log("setupResult", setupResult);

  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}
