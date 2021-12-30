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
function createTextVNode(text) {
    return createVNode(Text, {}, text);
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

// export function extend(effect, options) {
//     Object.assign(effect, options);
//   }
var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === "object";
};
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 转换为驼峰命名规范
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) {
        return c ? c.toUpperCase() : "";
    });
};
var toHandlerKey = function (str) {
    return str ? "on" + capitalize(str) : "";
};

var publicProprttiesMap = {
    $el: function (i) { return i.vnode.el; },
    // 父节点的children
    $slots: function (i) { return i.slots; },
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

function initSlots(instance, children) {
    // slot
    var vnode = instance.vnode;
    if (vnode.shapeFlags & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    var _loop_1 = function (key) {
        var value = children[key];
        slots[key] = function (props) { return normalizeSlotValue(value(props)); };
    };
    for (var key in children) {
        _loop_1(key);
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

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
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
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
// shallowReadonly
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    console.log("emit", event);
    // return () => {};
    var props = instance.props;
    //TPP
    // 先写一个特定行为，然后重构为通用的行为
    // 传过来是add,变成首字母大写，然后拼上on
    var handerName = toHandlerKey(camelize(event));
    var handler = props[handerName];
    handler && handler.apply(void 0, args);
}

// component
function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: function () { },
        slots: {},
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) || {},
        parent: parent,
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    // 初始化
    initProps(instance, instance.vnode.props);
    // 初始化==》父节点的children赋值给slots
    initSlots(instance, instance.vnode.children);
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
        //
        // currentInstance = instance;
        setCurrentInstance(instance);
        // function -> 组件的render函数 or object->将object注入当前组件上下文中
        var setupResult = setup(shallowReadonly(instance.props), {
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
function finishComponentSetup(instance) {
    var Component = instance.type;
    instance.render = Component.render;
}
// 借助全局变量
//  高阶使用场景，反对在应用的代码中使用，只能在setup或者生命周期钩子中使用
var currentInstance = null;
// getCurrentInstance
function getCurrentInstance() {
    return currentInstance;
}
// 赋值instance ,后续需要可以直接调用方法，而不是重复去赋值，并且控制修改入口，方便调试排查
function setCurrentInstance(instance) {
    currentInstance = instance;
}

// provide inject 跨层级
/**
 * provide inject 启用依赖注入，两者只能在使用当前活动实例的setup()期间被调用-->因为函数中调用了getCurrentInstance
 * vue3中是以函数调用的方式，vue2中是对象的方式
 * vue3:
 * import { InjectionKey, provide, inject } from 'vue'
 * provide(key, 'foo')
 * vue2:
 * data(){
 *   return {
 *   }
 * },
 * provide:{
 *   user: 'mia'
 * }
 * inject: ['user']
 *  * **/
function provide(key, value) {
    // provide 存
    // key value
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var provides = currentInstance.provides;
        var parentProvides = currentInstance.parent.provides;
        if (provides === parentProvides) {
            // init 第一次
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    console.log("key", key);
    // inject 取
    var currentInstance = getCurrentInstance();
    if (currentInstance) {
        var parentProvides = currentInstance.parent.provides;
        // console.log("inject", currentInstance);
        if (key in parentProvides) {
            return parentProvides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

// import { render } from "./renderer";
function createAPI(render) {
    return function createApp(rootComponent) {
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
    };
}
//render
// export function createApp(render, rootComponent) {
//   // 接收一个根组件
//   return {
//     mount(rootContainer) {
//       // 根容器 也就是#app
//       // 先把所有东西转为vnode
//       // component -> vnode
//       // 所有逻辑操作基于 vnode 来处理
//       const vnode = createVNode(rootComponent);
//       render(vnode, rootContainer);
//     },
//   };
// }

function createRenderer(options) {
    var createElement = options.createElement, patchProp = options.patchProp, insert = options.insert;
    function render(vnode, container) {
        // 调用patch方法
        patch(vnode, container, null);
    }
    function patch(vnode, container, parentComponent) {
        // fragment
        // fragment -->只渲染children
        var type = vnode.type, shapeFlags = vnode.shapeFlags;
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlags & 1 /* ELEMENT */) {
                    processElement(vnode, container, parentComponent);
                }
                else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(vnode, container, parentComponent);
                }
                break;
        }
    }
    function processText(vnode, container) {
        var children = vnode.children;
        var textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(vnode, container, parentComponent) {
        mountChildren(vnode, container, parentComponent);
    }
    function processElement(vnode, container, parentComponent) {
        mountElement(vnode, container, parentComponent);
    }
    function mountElement(vnode, container, parentComponent) {
        // vnode: type, props, children
        // const el = document.createElement('div');
        // el.textContent = 'hi,mini-vue~';
        // el.setAttribute('id', 'root');
        // document.body.append(el)
        // vnode 是element的
        var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlags = vnode.shapeFlags;
        //
        // 自定义渲染接口customRender
        // new Element() 不依赖平台，依赖接口
        // const el = (vnode.el = document.createElement(type));
        var el = (vnode.el = createElement(type));
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
            mountChildren(vnode, el, parentComponent);
        }
        for (var key in props) {
            var val = props[key];
            // console.log("key", key, val);
            // 以on开头，小驼峰的属性 如onClick
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   el.addEventListener(key.slice(2).toLowerCase(), val);
            // } else {
            //   el.setAttribute(key, val);
            // }
            patchProp(el, key, val);
        }
        // container.append(el);
        insert(el, container);
    }
    function mountChildren(vnode, el, parentComponent) {
        var _a;
        (_a = vnode.children) === null || _a === void 0 ? void 0 : _a.forEach(function (v) {
            patch(v, el, parentComponent);
        });
    }
    function processComponent(vnode, container, parentComponent) {
        // 挂载组件
        mountComponent(vnode, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 通过虚拟节点，创建组件实例对象
        var instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        var proxy = instance.proxy;
        var subTree = instance.render.call(proxy);
        // vnode-> patch
        // vnode-> element -> mountElement
        patch(subTree, container, instance);
        // 所有element处理完
        initialVNode.el = subTree.el;
    }
    return {
        createApp: createAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, val) {
    //  以on开头，小驼峰的属性 如onClick
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, container) {
    container.append(el);
}
var renderer = createRenderer({
    createElement: createElement,
    patchProp: patchProp,
    insert: insert,
});
function createApp() {
    var agrs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        agrs[_i] = arguments[_i];
    }
    return renderer.createApp.apply(renderer, agrs);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, renderSlots };
