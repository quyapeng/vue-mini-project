import { PublicInstanceProxyHandlers } from "./componentPublicinstance";
import { initProps } from "./componentProps";
import { initSlots } from "./componentSlots";
import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
// component
export function createComponentInstance(vnode) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: () => {},
    slots: {},
    provides: {},
  };
  component.emit = emit.bind(null, component) as any;
  return component;
}

export function setupComponent(instance) {
  // 初始化
  initProps(instance, instance.vnode.props);
  // 初始化==》父节点的children赋值给slots
  initSlots(instance, instance.vnode.children);
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
    //
    // currentInstance = instance;
    setCurrentInstance(instance);
    // function -> 组件的render函数 or object->将object注入当前组件上下文中
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    // currentInstance = null;
    setCurrentInstance(null);
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

// 借助全局变量
//  高阶使用场景，反对在应用的代码中使用，只能在setup或者生命周期钩子中使用
let currentInstance = null;
// getCurrentInstance
export function getCurrentInstance() {
  return currentInstance;
}

// 赋值instance ,后续需要可以直接调用方法，而不是重复去赋值，并且控制修改入口，方便调试排查
function setCurrentInstance(instance) {
  currentInstance = instance;
}
