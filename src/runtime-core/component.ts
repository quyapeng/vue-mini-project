import { PublicInstanceProxyHandlers } from "./componentPublicinstance";
import { initProps } from "./componentProps";
// component
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };

  return component;
}

export function setupComponent(instance) {
  // 初始化
  initProps(instance, instance.vnode.props);
  // initSlots()
  debugger;
  setupStatefulComponent(instance);
}
// 组件实例对象
function setupStatefulComponent(instance: any) {
  // setup返回值
  const Component = instance.type;
  // ctx
  // 1.初始化时，创建一个代理对象
  // 2.调用render的时候，将代理对象绑定到this
  instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);

  const { setup } = Component;

  if (setup) {
    // function -> 组件的render函数 or object->将object注入当前组件上下文中
    const setupResult = setup(instance.props);
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance, setupResult) {
  // function or object

  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
  }
  // console.log("setupResult", setupResult);

  finishComponentSetup(instance);
}
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  instance.render = Component.render;
}
