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

// export function extend(effect, options) {
var isObject = function (val) {
    return val !== null && typeof val === "object";
};

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
    instance.render = Component.render;
}

function render(vnode, container) {
    // 调用patch方法
    patch(vnode, container);
}
function patch(vnode, container) {
    // patch
    // 判断vnode是不是element 是->处理element  不是->不是element就应该是component,则需要处理component
    // vnode.type 是一个字符串就是element,如果是对象，就是component
    console.log(vnode.type);
    if (typeof vnode.type === "string") {
        // element
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 组件
        processComponent(vnode, container);
    }
    // 去处理组件
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode, container);
}
function mountComponent(vnode, container) {
    // 通过虚拟节点，创建组件实例对象
    var instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
function setupRenderEffect(instance, container) {
    var subTree = instance.render();
    // vnode-> patch
    // vnode-> element -> mountElement
    patch(subTree, container);
}
function processElement(vnode, container) {
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    // vnode: type, props, children
    // const el = document.createElement('div');
    // el.textContent = 'hi,mini-vue~';
    // el.setAttribute('id', 'root');
    // document.body.append(el)
    var type = vnode.type, props = vnode.props, children = vnode.children;
    var el = document.createElement(type);
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        // 数组，
        // children.forEach((v) => {
        //   patch(v, el);
        // });
        mountChildren(children, el);
    }
    for (var key in props) {
        var val = props[key];
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(children, el) {
    children.forEach(function (v) {
        patch(v, el);
    });
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
            render(vnode, rootContainer);
        },
    };
}

//
function h(type, props, children) {
    //
    return createVNode(type, props, children);
}

export { createApp, h };
