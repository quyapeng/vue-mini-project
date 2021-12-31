'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
//
function createVNode(type, props, children) {
    // 创建一个虚拟节点
    const vnode = {
        type,
        props,
        children,
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
    const slot = slots[name];
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
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const hasChanged = (value, newValue) => {
    // 如果相等，则未改变，如果不相等，则为已改变
    return !Object.is(value, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
// 转换为驼峰命名规范
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

const publicProprttiesMap = {
    $el: (i) => i.vnode.el,
    // 父节点的children
    $slots: (i) => i.slots,
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        // key -> msg
        // setupState
        const { setupState, props } = instance;
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
        const publicGetter = publicProprttiesMap[key];
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
    const { vnode } = instance;
    if (vnode.shapeFlags & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

let activeEffect;
let shouldTrack;
// 抽离概念
class ReactiveEffect {
    // 外部直接获取到scheduler ,则使用public
    constructor(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
        // this.scheduler = scheduler;
    }
    run() {
        // 1.会收集依赖
        // shouldTrack来做区分
        // active区分stop状态
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        // 全局变量用完需要reset
        shouldTrack = false;
        return result;
    }
    stop() {
        //清除effect
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop)
                this.onStop();
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    // 把effect.deps清空
    effect.deps.length = 0;
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = targetMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    // 函数抽离
    trackEffect(dep);
}
function trackEffect(dep) {
    //看看dep之前有没有添加过，如果已经添加过，就不在添加
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}
function trigger(target, key) {
    // 基于 取出dep,调用所有fn
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffect(dep);
}
// 从trigger中抽离
function triggerEffect(dep) {
    for (const effect of dep) {
        // console.log("effect", effect);
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // _effect.onStop = options.onStop;
    extend(_effect, options);
    _effect.run();
    // 调用run方法的时候直接执行fn
    let runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

// 定义出来只调用一次，然后存储在变量get中，后续不需要每次都去调用，缓存机制，
const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
// 利用高阶函数
// 抽离出get函数，两个区别为track是否需要调用，也就是是否需要收集依赖？
function createGetter(isReadonly = false, shallow = false) {
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
        const res = Reflect.get(target, key);
        // shallow
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        if (!isReadonly)
            track(target, key);
        return res;
    };
}
// 保持代码一致性，set也可以抽离
function createSetter() {
    //  默认值为false
    // 是否是只读
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set,
};
const readonlyHandlers = {
    get: readonlyGet,
    set(target, key, value) {
        // 警告
        console.warn(`key:${key} set 失败，因为 target:${target} 是readonly`, key, target);
        return true;
    },
};
// shallowreadonly
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
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
        console.warn(`target ${target}必须是一个对象`);
        return target;
    }
    return new Proxy(target, baseHandlers);
}
// shallowReadonly
function shallowReadonly(raw) {
    return createReactiveObject(raw, shallowReadonlyHandlers);
}

function emit(instance, event, ...args) {
    console.log("emit", event);
    // return () => {};
    const { props } = instance;
    //TPP
    // 先写一个特定行为，然后重构为通用的行为
    // 传过来是add,变成首字母大写，然后拼上on
    const handerName = toHandlerKey(camelize(event));
    const handler = props[handerName];
    handler && handler(...args);
}

// component
function createComponentInstance(vnode, parent) {
    console.log("createComponentInstance", parent);
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: () => { },
        slots: {},
        provides: (parent === null || parent === void 0 ? void 0 : parent.provides) || {},
        parent,
        isMounted: false,
        subTree: {},
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
        instance.setupState = proxyRefs(setupResult);
    }
    // console.log("setupResult", setupResult);
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
// 借助全局变量
//  高阶使用场景，反对在应用的代码中使用，只能在setup或者生命周期钩子中使用
let currentInstance = null;
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
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        let parentProvides = currentInstance.parent.provides;
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
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
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
            mount(rootContainer) {
                // 根容器 也就是#app
                // 先把所有东西转为vnode
                // component -> vnode
                // 所有逻辑操作基于 vnode 来处理
                const vnode = createVNode(rootComponent);
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
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    function render(n2, container) {
        // 调用patch方法
        patch(null, n2, container, null);
    }
    // n1  老的
    // n2  新的
    function patch(n1, n2, container, parentComponent) {
        // fragment
        // fragment -->只渲染children
        const { type, shapeFlags } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlags & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n1, n2, container, parentComponent);
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n1, n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2, container);
        }
    }
    function patchElement(n1, n2, container) {
        console.log("patchElement", n1, n2, container);
        // props
        // children
    }
    function mountElement(n1, n2, container, parentComponent) {
        // vnode: type, props, children
        // const el = document.createElement('div');
        // el.textContent = 'hi,mini-vue~';
        // el.setAttribute('id', 'root');
        // document.body.append(el)
        // vnode 是element的
        const { type, props, children, shapeFlags } = n2;
        //
        // 自定义渲染接口customRender
        // new Element() 不依赖平台，依赖接口
        // const el = (vnode.el = document.createElement(type));
        const el = (n2.el = hostCreateElement(type));
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
            mountChildren(n1, n2, el, parentComponent);
        }
        for (const key in props) {
            const val = props[key];
            // console.log("key", key, val);
            // 以on开头，小驼峰的属性 如onClick
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   el.addEventListener(key.slice(2).toLowerCase(), val);
            // } else {
            //   el.setAttribute(key, val);
            // }
            hostPatchProp(el, key, val);
        }
        // container.append(el);
        hostInsert(el, container);
    }
    function mountChildren(n1, n2, el, parentComponent) {
        var _a;
        (_a = n2.children) === null || _a === void 0 ? void 0 : _a.forEach((v) => {
            patch(null, v, el, parentComponent);
        });
    }
    function processComponent(n1, n2, container, parentComponent) {
        // 挂载组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 通过虚拟节点，创建组件实例对象
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAPI(render),
    };
}

function createElement(type) {
    console.log("createElement");
    return document.createElement(type);
}
function patchProp(el, key, val) {
    console.log("patchProp");
    //  以on开头，小驼峰的属性 如onClick
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), val);
    }
    else {
        el.setAttribute(key, val);
    }
}
function insert(el, container) {
    console.log("insert");
    container.append(el);
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
});
function createApp(...agrs) {
    return renderer.createApp(...agrs);
}

// ref是一个单值，1 true '2'
// proxy 只针对 object
// 单值类型，通过对象来包裹。
// ref impl  接口缩写
class refImpl {
    constructor(value) {
        this.__is_ref = true;
        // this._value = value;
        // 看看value是不是对象，如value是对象 value -> reactive
        // this._value = isObject(value) ? reactive(value) : value; 抽离公共方法
        this._value = convert(value);
        this.dep = new Set();
        this._rawValue;
    }
    get value() {
        // 调用get的时候收集依赖
        // if (isTracking()) {
        //   trackEffect(this.dep);
        // }
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        // 设置value 一定先去修改value的值
        // newValue -> this._value
        // hasChanged
        // 如果set前后的值相等，就不需要重新触发trigger
        // if (Object.is(newValue, this._value)) return;
        // 对比的时候也需要知道是object还是非object
        if (hasChanged(newValue, this._rawValue)) {
            this._value = newValue;
            this._value = convert(newValue);
            // 触发trigger
            triggerEffect(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    // 调用get的时候收集依赖
    if (isTracking()) {
        trackEffect(ref.dep);
    }
}
function ref(value) {
    return new refImpl(value);
}
function isRef(ref) {
    return !!ref.__is_ref;
}
function unRef(ref) {
    // 看看是不是ref,如果是就返回ref.value  反之返回当前值
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    // get set
    return new Proxy(objectWithRefs, {
        // get -> 如果是ref，则返回 .value, 否则返回value本身
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // set -> ref  .value
            if (isRef(target[key]) && !isRef(value)) {
                target[key].value = value;
            }
            else {
                Reflect.set(target, key, value);
            }
            return true;
        },
    });
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
