var Fragment = Symbol("Fragment");
var Text = Symbol("Text");
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
        vnode.shapeFlags |= 4 /* TEXT_CHILDREN */;
        // vnode.shapeFlags = vnode.shapeFlags | ShapeFlags.TEXT_CHILDREN;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlags |= 8 /* ARRAY_CHILDREN */;
    }
    // 组件+ children是object
    if (vnode.shapeFlags & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlags |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

// export function extend(effect, options) {
//     Object.assign(effect, options);
//   }
var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === "object";
};

var targetMap = new Map();
function trigger(target, key) {
    // 基于 取出dep,调用所有fn
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    triggerEffect(dep);
}
// 从trigger中抽离
function triggerEffect(dep) {
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        // console.log("effect", effect);
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
}

// 定义出来只调用一次，然后存储在变量get中，后续不需要每次都去调用，缓存机制，
var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
// 利用高阶函数
// 抽离出get函数，两个区别为track是否需要调用，也就是是否需要收集依赖？
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    //  默认值为false
    // 是否是只读
    return function get(target, key) {
        //
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__V_isReadonly" /* IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        // shallow
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
// 保持代码一致性，set也可以抽离
function createSetter() {
    //  默认值为false
    // 是否是只读
    return function set(target, key, value) {
        var res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        // 警告
        console.warn("key:" + key + " set \u5931\u8D25\uFF0C\u56E0\u4E3A target:" + target + " \u662Freadonly", key, target);
        return true;
    },
};
// shallowreadonly
extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(raw) {
    // 处理ts config lib ["DOM","es6"]
    return createReactiveObject(raw, mutableHandlers);
}
// readonly
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function createReactiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn("target " + target + "\u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61");
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function render(vnode, container) {
    // 调用patch方法
    patch(vnode, container);
}
function patch(vnode, container) {
    // fragment
    // fragment -->只渲染children
    var type = vnode.type, shapeFlag = vnode.shapeFlag;
    switch (type) {
        case Fragment:
            processFragment(vnode, container);
            break;
        case Text:
            processText(vnode, container);
            break;
        default:
            if (shapeFlag & 1 /* ELEMENT */) {
                processElement(vnode, container);
            }
            else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                processComponent(vnode, container);
            }
            break;
    }
    // shapeflags vnode->flag
    // elementflag
    // patch
    // 判断vnode是不是element 是->处理element  不是->不是element就应该是component,则需要处理component
    // vnode.type 是一个字符串就是element,如果是对象，就是component
    // console.log(vnode.type);
    // 结构出shapeflag ,看啥是element还是组件
    // if (typeof vnode.type === "string") {
    //   // element
    //   processElement(vnode, container);
    // } else if (isObject(vnode.type)) {
    //   // 组件
    //   processComponent(vnode, container);
    // }
    // 去处理组件
}
function processFragment(vnode, container) {
    mountChildren(vnode, container);
}
function processText(vnode, container) {
    var children = vnode.children;
    var textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
}
function processComponent(vnode, container) {
    // 挂载组件
    mountChildren(vnode, container);
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
        // 以on开头，小驼峰的属性 如onClick
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            el.addEventListener(key.slice(2).toLowerCase(), val);
        }
        else {
            el.setAttribute(key, val);
        }
    }
    container.append(el);
}
function mountChildren(_a, el) {
    var children = _a.children;
    children === null || children === void 0 ? void 0 : children.forEach(function (v) {
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

function renderSlots(slots, name, props) {
    // children -> vnode
    // 是否有slots name
    var slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === "function") {
            // children不可以有数组==》fragment
            // 只需要吧children渲染出来就可以，不需要渲染此处根节点div
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

export { createApp, h, renderSlots };
