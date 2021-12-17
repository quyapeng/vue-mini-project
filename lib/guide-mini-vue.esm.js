//
function createVNode(type, props, children) {
    // 创建一个虚拟节点
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlags: getShapeFlag(type),
        el: null,
    };
    if (typeof children === "string") {
        // children
        vnode.shapeFlags = vnode.shapeFlags | 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags = 8 /* ARRAY_CHILDREN */;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

var publicProprttiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        // key -> msg
        // setupState
        var setupState = instance.setupState, props = instance.props;
        if (key in setupState) {
            return setupState[key];
        }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        // key -> $el  $data,
        // if (key === "$el") {
        //   return instance.vnode.$el;
        // }
        //
        var publicGetter = publicProprttiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
    // {
    //   get(target, key) {
    //     // key -> msg
    //     // setupState
    //     const { setupState } = instance;
    //     if (key in setupState) {
    //       return setupState[key];
    //     }
    //     // key -> $el
    //     if (key === "$el") {
    //       return instance.vnode.$el;
    //     }
    //   },
    // }
};

function initProps(instance, rawProps) {
    // attrs
    instance.props = rawProps || {};
}

// component
function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
    };
    return component;
}
function setupComponent(instance) {
    // 初始化
    initProps(instance, instance.vnode.props);
    // initSlots()
    setupStatefulComponent(instance);
}
// 组件实例对象
function setupStatefulComponent(instance) {
    // setup返回值
    var Component = instance.type;
    // ctx
    // 1.初始化时，创建一个代理对象
    // 2.调用render的时候，将代理对象绑定到this
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = Component.setup;
    if (setup) {
        // function -> 组件的render函数 or object->将object注入当前组件上下文中
        var setupResult = setup(instance.props);
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
function finishComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}

function render(vnode, container) {
    // 调用patch方法
    patch(vnode, container);
}
function patch(vnode, container) {
    // shapeflags vnode->flag
    // elementflag
    // patch
    // 判断vnode是不是element 是->处理element  不是->不是element就应该是component,则需要处理component
    // vnode.type 是一个字符串就是element,如果是对象，就是component
    // console.log(vnode.type);
    // 结构出shapeflag ,看啥是element还是组件
    var shapeFlags = vnode.shapeFlags;
    if (shapeFlags & 1 /* ELEMENT */) {
        // ELEMENT
        processElement(vnode, container);
    }
    else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
        // STATEFUL_COMPONENT
        processComponent(vnode, container);
    }
    // if (typeof vnode.type === "string") {
    //   // element
    //   processElement(vnode, container);
    // } else if (isObject(vnode.type)) {
    //   // 组件
    //   processComponent(vnode, container);
    // }
    // 去处理组件
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    // 通过虚拟节点，创建组件实例对象
    var instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
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
    // vnode 是element的
    var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlags = vnode.shapeFlags;
    var el = (vnode.el = document.createElement(type));
    // & 运算符判断是否为0的
    // text_children
    // if (typeof children === "string") {
    //   el.textContent = children;
    // } else if (Array.isArray(children)) {
    //   // 数组，
    //   // children.forEach((v) => {
    //   //   patch(v, el);
    //   // });
    //   // array_children
    //   mountChildren(vnode, el);
    // }
    // shape
    if (shapeFlags & 4 /* TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlags & 8 /* ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    for (var key in props) {
        var val = props[key];
        // console.log("key", key, val);
        if (isOn(key)) {
            el.addEventListener(key.slice(2).toLowerCase(), val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
var isOn = function (key) { return /^on[A-Z]/.test(key); };
function mountChildren(_a, el) {
    var children = _a.children;
    children.forEach(function (v) {
        patch(v, el);
    });
}
function setupRenderEffect(instance, initialVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    // vnode-> patch
    // vnode-> element -> mountElement
    patch(subTree, container);
    // 所有element处理完
    initialVNode.el = subTree.el;
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
