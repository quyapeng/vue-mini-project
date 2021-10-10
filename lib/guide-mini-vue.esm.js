//
function createVNode(type, props, children) {
    // 创建一个虚拟节点
    var vnode = {
        type: type,
        props: props,
        children: children,
    };
    return vnode;
}

// component
function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
    };
    return component;
}
function setupComponent(instance) {
    // 初始化
    // initProps()
    // initSlots()
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    // setup返回值
    var Component = instance.type;
    var setup = Component.setup;
    if (setup) {
        // function -> 组件的render函数 or object->将object注入当前组件上下文中
        var setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function or object
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var Component = instance.type;
    if (Component.render) {
        instance.render = Component.render;
    }
}

function render(vnode, container) {
    // 调用patch方法
    patch(vnode);
}
function patch(vnode, container) {
    // patch
    // 判断是不是
    // 去处理组件
    processComponent(vnode);
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode);
}
function mountComponent(vnode, container) {
    // 通过虚拟节点，创建组件实例对象
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    // vnode-> patch
    // vnode-> element -> mountElement
    patch(subTree);
}

//
function createApp(rootComponent) {
    // 接收一个根组件
    return {
        mount: function (rootContainer) {
            // 根容器 也就是#app
            // 先把所有东西转为vnode
            // component -> vnode
            // 所有逻辑操作基于 vnode 来处理
            var vnode = createVNode(rootComponent);
            render(vnode);
        },
    };
}

//
function h(type, props, children) {
}

export { createApp, h };
