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
        key: props === null || props === void 0 ? void 0 : props.key,
        children,
        shapeFlags: getShapeFlag(type),
        el: null,
        component: null,
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

function toDisplayString(value) {
    return String(value);
}

// export function extend(effect, options) {
//     Object.assign(effect, options);
//   }
const extend = Object.assign;
const isObject = (val) => {
    return val !== null && typeof val === "object";
};
const isString = (val) => typeof val === "string";
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
    //
    $props: (i) => i.props,
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
    // template
    if (compiler && !Component.render) {
        // render优先级高
        if (Component.template) {
            Component.render = compiler(Component.template);
        }
    }
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
let compiler;
function registerRuntimeCompiler(_compiler) {
    compiler = _compiler;
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

function shouldUpdateComponent(prevVNode, nextVNode) {
    // shouldUpdateComponent
    const { props: prevProp } = prevVNode;
    const { props: nextProp } = nextVNode;
    for (const key in nextProp) {
        // if (nextProp[key] !== prevProp[key]) {
        //   return true;
        // }
        return nextProp[key] !== prevProp[key];
    }
    return false;
}

const queue = [];
let isFlushPending = false;
const p = Promise.resolve();
function nextTick(fn) {
    return fn ? p.then(fn) : p;
}
function queueJobs(job) {
    //
    if (!queue.includes(job)) {
        queue.push(job);
    }
    // 微任务
    queueFlush();
}
function queueFlush() {
    // 微任务
    if (isFlushPending)
        return;
    isFlushPending = true;
    nextTick(flushJobs);
    // Promise.resolve().then(() => {
    //   flushJobs();
    // });
}
function flushJobs() {
    isFlushPending = false;
    // 执行job
    let job;
    while ((job = queue.shift())) {
        job && job();
    }
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        // 调用patch方法
        // render的时候不需要anchor
        patch(null, vnode, container, null, null);
    }
    // n1  老的
    // n2  新的
    function patch(n1, n2, container, parentComponent, anchor) {
        // fragment
        // fragment -->只渲染children
        const { type, shapeFlags } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlags & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlags & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement", n1, n2, container);
        // props
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = (n2.el = n1.el);
        patchChildren(n1, n2, el, parentComponent, anchor);
        patchProps(el, oldProps, newProps);
        // children
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        //
        const { shapeFlags: prevShapeFlag } = n1;
        const { shapeFlags: nextShapeFlag } = n2;
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & 4 /* TEXT_CHILDREN */) {
            // new text
            if (prevShapeFlag & 8 /* ARRAY_CHILDREN */) {
                // array
                // 1. 把老的children清空
                // 2. 设置text
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            // new array
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                //array diff arry
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        // c1老的数组, c2新的的数组
        // 索引
        const l2 = c2.length;
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        //  右侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        // console.log(i);
        // 3. 新的比老的多 创建
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            // 乱序 中间对比
            let s1 = i; // 老节点
            let s2 = i;
            let patched = 0;
            const toBePatched = e2 - s2 + 1;
            const keyToNewIndexMap = new Map();
            const newIndexToOldIndexMap = new Array(toBePatched);
            let moved = false;
            let maxNewIndexSoFar = 0;
            //
            for (let i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0;
            for (let i = s2; i <= e2; i++) {
                let nextChild = c2[i];
                keyToNewIndexMap.set(nextChild.key, i);
            }
            // console.log("keyToNewIndexMap", keyToNewIndexMap);
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                if (patched >= toBePatched) {
                    hostRemove(prevChild.el);
                    continue;
                }
                let newIndex;
                if (prevChild.key !== null) {
                    //
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            //跳出当前循环
                            break;
                        }
                    }
                }
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 已存在 避免i为0时出错，此处需要+1
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patched++;
                }
            }
            const insreasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : [];
            // console.log("insreasingNewIndexSequence", insreasingNewIndexSequence);
            let j = insreasingNewIndexSequence.length - 1;
            //
            for (let i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) {
                    // 创建新的
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    if (j < 0 || i !== insreasingNewIndexSequence[j]) {
                        console.log("移动位置", insreasingNewIndexSequence[j]);
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    // 是相同的vnode
    function isSameVNodeType(n1, n2) {
        // 1,type
        // 2.key
        return n1.type === n2.type && n1.key === n2.key;
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            // remove
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            // 属性变更
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== {}) {
                // 属性删除
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
        // vnode: type, props, children
        // const el = document.createElement('div');
        // el.textContent = 'hi,mini-vue~';
        // el.setAttribute('id', 'root');
        // document.body.append(el)
        // vnode 是element的
        const { type, props, children, shapeFlags } = vnode;
        //
        // 自定义渲染接口customRender
        // new Element() 不依赖平台，依赖接口
        // const el = (vnode.el = document.createElement(type));
        const el = (vnode.el = hostCreateElement(type));
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
            mountChildren(children, el, parentComponent, anchor);
        }
        for (const key in props) {
            // console.log("key", key, val);
            // 以on开头，小驼峰的属性 如onClick
            // const isOn = (key: string) => /^on[A-Z]/.test(key);
            // if (isOn(key)) {
            //   el.addEventListener(key.slice(2).toLowerCase(), val);
            // } else {
            //   el.setAttribute(key, val);
            // }
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // container.append(el);
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children === null || children === void 0 ? void 0 : children.forEach((v) => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    function processComponent(n1, n2, container, parentComponent, anchor) {
        // 挂载组件
        if (!n1) {
            // n1没有的时候才是mount
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            // 有值的时候是更新
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            // component最新
            instance.next = n2;
            instance.update();
        }
        else {
            n2.el = n1.el;
            n2.vnode = n2;
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        // 通过虚拟节点，创建组件实例对象
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        instance.update = effect(() => {
            if (!instance.isMounted) {
                console.log("init");
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy, proxy));
                patch(null, subTree, container, instance, anchor);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // 更新当前组件实例上的属性 props
                // 需要一个更新之后的虚拟节点
                const { next, vnode } = instance;
                if (next) {
                    //
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                //
                console.log("update");
                const { proxy } = instance;
                const subTree = instance.render.call(proxy, proxy);
                const prevSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        }, {
            scheduler() {
                console.log("update-scheduler");
                queueJobs(instance.update);
            },
        });
    }
    return {
        createApp: createAPI(render),
    };
}
function updateComponentPreRender(instance, nextVNode) {
    // 重新设置vnode,并清空
    instance.vnode = nextVNode;
    instance.next = null;
    instance.props = nextVNode.props;
}
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
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

function createElement(type) {
    console.log("createElement");
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    console.log("patchProp");
    //  以on开头，小驼峰的属性 如onClick
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        el.addEventListener(key.slice(2).toLowerCase(), nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(child, parent, anchor) {
    // parent.append(child)
    // debugger;
    parent.insertBefore(child, anchor || null);
}
function remove(child) {
    //
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
function createApp(...agrs) {
    return renderer.createApp(...agrs);
}

var runtimeDom = /*#__PURE__*/Object.freeze({
    __proto__: null,
    createApp: createApp,
    h: h,
    renderSlots: renderSlots,
    createTextVNode: createTextVNode,
    createElementVNode: createVNode,
    getCurrentInstance: getCurrentInstance,
    registerRuntimeCompiler: registerRuntimeCompiler,
    provide: provide,
    inject: inject,
    createRenderer: createRenderer,
    nextTick: nextTick,
    toDisplayString: toDisplayString,
    ref: ref,
    proxyRefs: proxyRefs
});

const name = "toDisplayString";
const element = "createElementVNode";
const TO_DISPLAY_STRING = Symbol(name);
const CREATE_ELEMENT_VNODE = Symbol(element);
const helperMapName = {
    [TO_DISPLAY_STRING]: name,
    [CREATE_ELEMENT_VNODE]: element,
};

var NodeTypes;
(function (NodeTypes) {
    NodeTypes[NodeTypes["INTERPOLATION"] = 0] = "INTERPOLATION";
    NodeTypes[NodeTypes["SIMPLE_EXPRESSION"] = 1] = "SIMPLE_EXPRESSION";
    NodeTypes[NodeTypes["ELEMENT"] = 2] = "ELEMENT";
    NodeTypes[NodeTypes["TEXT"] = 3] = "TEXT";
    NodeTypes[NodeTypes["ROOT"] = 4] = "ROOT";
    NodeTypes[NodeTypes["COMPOUND_EXPRESSION"] = 5] = "COMPOUND_EXPRESSION";
})(NodeTypes || (NodeTypes = {}));
function createVNodeCall(context, tag, props, children) {
    context.helper(CREATE_ELEMENT_VNODE);
    return {
        type: NodeTypes.ELEMENT,
        tag,
        props,
        children,
    };
}

// 模块职责划分清晰明确
function generate(ast) {
    const context = createCodegenContext();
    const { push } = context;
    // 导入逻辑抽取
    genFunctionPreamble(ast, context);
    //   const VueBinging = "Vue";
    //   //   const helpers = ["toDisplayString"];
    //   //   const aliasHelpers = (s: any) => `${s}: _${s}`;
    //   const helpers = ["toDisplayString"];
    //   const aliasHelpers = (s: any) => `${s}: _${s}`;
    //   // 插值 render 导入
    //   //   push(`const { ${helpers.map(aliasHelpers)} } = ${VueBinging};`);
    //   push(`const { ${ast.helpers.map(aliasHelpers)} } = ${VueBinging};`);
    //   push("\n");
    //   push("return ");
    const FunctionName = "render";
    const args = ["_ctx", "_cache"];
    const signature = args.join(", ");
    // console.log("ast", ast);
    push(`function ${FunctionName}(${signature}){`);
    push("return ");
    genNode(ast.codegenNode, context);
    push("}");
    //   code += `function ${FunctionName}(${signature}){`;
    //   // 介于灵活考虑，这一部分放在transform中处理好之后再返回，此处直接使用。
    //   //   console.log("ast", ast);
    //   //   const node = ast.children[0];
    //   const node = ast.codegenNode;
    //   code += `return '${node.content}'`;
    //   code += "}";
    return {
        code: context.code,
    };
}
function genFunctionPreamble(ast, context) {
    const { push } = context;
    const VueBinging = "Vue";
    //   const helpers = ["toDisplayString"];
    //   const aliasHelpers = (s: any) => `${s}: _${s}`;
    const aliasHelpers = (s) => `${helperMapName[s]}: _${helperMapName[s]}`;
    // 插值 render 导入
    //   push(`const { ${helpers.map(aliasHelpers)} } = ${VueBinging};`);
    if (ast.helpers.length > 0)
        push(`const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${VueBinging};`);
    push("\n");
    push("return ");
}
function createCodegenContext() {
    const context = {
        code: "",
        push(source) {
            context.code += source;
        },
        helper(key) {
            return `_${helperMapName[key]}`;
        },
    };
    return context;
}
function genNode(node, context) {
    switch (node.type) {
        case NodeTypes.TEXT:
            genText(node, context);
            break;
        case NodeTypes.INTERPOLATION:
            genInterpolation(node, context);
            break;
        case NodeTypes.SIMPLE_EXPRESSION:
            genExpression(node, context);
            break;
        case NodeTypes.ELEMENT:
            genElement(node, context);
            break;
        case NodeTypes.COMPOUND_EXPRESSION:
            genCompoundExpression(node, context);
            break;
    }
}
function genCompoundExpression(node, context) {
    const { push } = context;
    const { children } = node;
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (isString(child)) {
            push(child);
        }
        else {
            genNode(child, context);
        }
    }
}
function genElement({ tag, children, props }, context) {
    //
    const { push, helper } = context;
    // console.log("children", children);
    push(`${helper(CREATE_ELEMENT_VNODE)}(`);
    // console.log("llll", genNullable([tag, props, children]));
    genNodeList(genNullable([tag, props, children]), context);
    // const child = children[0];
    // genNode(children, context);
    // for (let i = 0; i < children.length; i++) {
    //   const child = children[i];
    //   genNode(child, context);
    // }
    push(")");
}
function genNodeList(nodes, context) {
    // console.log("nodes", nodes);
    const { push } = context;
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // 如果是string
        if (isString(node)) {
            push(node);
        }
        else {
            genNode(node, context);
        }
        if (i < nodes.length - 1)
            push(",");
    }
}
function genNullable(args) {
    return args.map((arg) => arg || "null");
}
function genExpression(node, context) {
    const { push } = context;
    push(`${node.content}`);
}
function genInterpolation(node, context) {
    const { push, helper } = context;
    push(`${helper(TO_DISPLAY_STRING)}(`);
    genNode(node.content, context);
    push(")");
}
function genText(node, context) {
    const { push } = context;
    push(`'${node.content}'`);
}

const openDelimiter = "{{";
const closeDelimiter = "}}";
function baseParse(content) {
    // 创建一个全局的上下文对象
    const context = createParserContext(content);
    return createRoot(parseChildren(context, []));
}
function parseChildren(context, ancestors) {
    const nodes = [];
    // console.log("isend", !isEnd(context, ancestors));
    while (!isEnd(context, ancestors)) {
        let node;
        let s = context.source;
        if (s.startsWith(openDelimiter)) {
            node = parseInterpolation(context);
        }
        else if (s[0] === "<") {
            // < 开始
            if (/[a-z]/i.test(s[1])) {
                // 第二位是字母，不限制大小
                // console.log("element div", s);
                node = parseElement(context, ancestors);
            }
        }
        //
        if (!node) {
            node = parseText(context);
        }
        nodes.push(node);
    }
    return nodes;
}
function isEnd(context, ancestors) {
    // 1. source 有值
    // 2. 当遇到结束标签的时候
    const s = context.source;
    if (s.startsWith("</")) {
        for (let i = ancestors.length - 1; i >= 0; i--) {
            const tag = ancestors[i].tag;
            if (startsWithEndTagOpen(s, tag)) {
                return true;
            }
        }
    }
    return !s;
}
function parseText(context) {
    //
    let endTokens = ["<", "{{"];
    let endIndex = context.source.length;
    for (let i = 0; i < endTokens.length; i++) {
        // console.log("context.source", context.source);
        let index = context.source.indexOf(endTokens[i]);
        if (index !== -1 && endIndex > index) {
            // 有
            endIndex = index;
        }
    }
    // 1. 获取到值，
    // const content = context.source.slice(0, context.source.length);
    // console.log("parseText", context.source);
    // // 2. 推进， 截取掉
    // advanceBy(context, content.length);
    // console.log("parseText 为空", context.source);
    const content = parseTextData(context, endIndex);
    // console.log("content", content);
    return {
        type: NodeTypes.TEXT,
        content,
    };
}
function parseTag(context, type) {
    // 1.解析 div
    // 2.删除解析过的node
    const match = /^<\/?([a-zA-Z]*)/i.exec(context.source);
    const tag = match[1];
    //  match 为 [ '<div', 'div', index: 0, input: '<div></div>', groups: undefined ]
    // 正则匹配出的第一位是'<div',最后一位'>'也需要
    /*
    源码此处是分两步处理 我喜欢一次搞定。
    advanceBy(context, match[0].length);
    advanceBy(context, 1);
    **/
    advanceBy(context, match[0].length + 1);
    // advanceBy(context, match[0].length);
    // advanceBy(context, 1);
    // console.log(context.source);
    if (type == 1 /* End */)
        return;
    return {
        type: NodeTypes.ELEMENT,
        tag,
    };
}
function parseTextData(context, length) {
    const content = context.source.slice(0, length);
    // console.log("parseText", context.source);
    // 推进， 截取掉
    advanceBy(context, length);
    return content;
}
function parseElement(context, ancestors) {
    // 1.解析 div
    // 2.删除解析过的node
    const element = parseTag(context, 0 /* Start */);
    ancestors.push(element);
    element.children = parseChildren(context, ancestors);
    ancestors.pop();
    // console.log("element.tag", element.tag);
    // console.log("context.source", context.source);
    // 前后tag一致
    // if (context.source.slice(2, 2 + element.tag.length) === element.tag) {
    if (startsWithEndTagOpen(context.source, element.tag)) {
        parseTag(context, 1 /* End */);
    }
    else {
        // 报错
        throw new Error(`缺少结束标签：${element.tag}`);
    }
    // console.log("parseElement", context.source);
    return element;
}
function startsWithEndTagOpen(source, tag) {
    return (source.startsWith("</") &&
        source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase());
}
function parseInterpolation(context) {
    // {{message}} 获取到message内容
    // 从index为2开始查找，前面0，1是固定的 {{ ,减少没必要的查询,所以indexof 第二个参数为open的长度
    // 去除前面固定 {{ 的叫法为 推进
    // 最后一个index
    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
    //
    //   context.source = context?.source.substr(0, closeIndex);
    // 先删除掉前面的
    //   context.source = context?.source.slice(openDelimiter.length);
    advanceBy(context, openDelimiter.length);
    // 最终解析出来内容的长度
    const rawContentLength = closeIndex - openDelimiter.length;
    // const rawContent = context.source.slice(0, rawContentLength);
    const rawContent = parseTextData(context, rawContentLength);
    const content = rawContent.trim();
    advanceBy(context, closeDelimiter.length);
    //   context.source = context.source.slice(
    //     rawContentLength + closeDelimiter.length
    //   );
    // console.log("context", context);
    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content,
        },
    };
}
function advanceBy(context, length) {
    context.source = context.source.slice(length);
}
// 创建根结点
function createRoot(children) {
    return {
        children,
        type: NodeTypes.ROOT,
    };
}
function createParserContext(content) {
    return {
        source: content,
    };
}

function transform(root, options = {}) {
    const context = createTransformContext(root, options);
    traverseNode(root, context);
    // 处理codegen root.codegenNode
    createRootCodegen(root);
    root.helpers = [...context.helpers.keys()];
}
function createRootCodegen(root) {
    const child = root.children[0];
    if (child.type === NodeTypes.ELEMENT) {
        root.codegenNode = child.codegenNode;
    }
    else {
        root.codegenNode = root.children[0];
    }
}
function createTransformContext(root, { nodeTransforms = [] }) {
    let context = {
        root,
        nodeTransforms,
        helpers: new Map(),
        helper(key) {
            context.helpers.set(key, 1);
        },
    };
    return context;
}
function traverseNode(node, context) {
    //
    // console.log("node", node); 以下内容为定制化，放在入口处由调用方选择是否使用
    // if (node.type == NodeTypes.TEXT) {
    //   node.content = node.content + " mini-vue";
    // }
    const { nodeTransforms } = context;
    const exitFns = [];
    for (let i = 0; i < nodeTransforms.length; i++) {
        const transform = nodeTransforms[i];
        // 先收集
        const onExit = transform(node, context);
        if (onExit)
            exitFns.push(onExit);
    }
    switch (node.type) {
        case NodeTypes.INTERPOLATION:
            context.helper(TO_DISPLAY_STRING);
            break;
        case NodeTypes.ROOT:
        case NodeTypes.ELEMENT:
            traverseChildren(node, context);
            break;
    }
    // 先调用后执行，
    let i = exitFns.length;
    while (i--) {
        exitFns[i]();
    }
}
function traverseChildren({ children }, context) {
    // if (children) {
    for (let i = 0; i < children.length; i++) {
        const node = children[i];
        traverseNode(node, context);
    }
    // }
}

function transformElement(node, context) {
    if (node.type === NodeTypes.ELEMENT) {
        return () => {
            // 中间处理层
            // tag
            const vnodeTag = `"${node.tag}"`;
            // props
            let vnodeProps;
            // children
            const { children } = node;
            let vnodeChildren = children[0];
            // const vnodeElement = {
            //   type: NodeTypes.ELEMENT,
            //   tag: `"${tag}"`,
            //   props: vnodeProps,
            //   children: vnodeChildren,
            // };
            node.codegenNode = createVNodeCall(context, vnodeTag, vnodeProps, vnodeChildren);
        };
    }
}

function transformExpression(node) {
    if (node.type === NodeTypes.INTERPOLATION) {
        node.content = processExpression(node.content);
    }
}
function processExpression(node) {
    node.content = `_ctx.${node.content}`;
    return node;
}

function isText(node) {
    return node.type === NodeTypes.TEXT || node.type === NodeTypes.INTERPOLATION;
}

function transformText(node) {
    if (node.type === NodeTypes.ELEMENT) {
        return () => {
            // 添加复合类型
            const { children } = node;
            let currentContainer;
            for (let i = 0; i < children.length; i++) {
                const child = children[i];
                if (isText(child)) {
                    // 是
                    for (let j = i + 1; j < children.length; j++) {
                        const next = children[j];
                        if (isText(next)) {
                            if (!currentContainer) {
                                currentContainer = children[i] = {
                                    type: NodeTypes.COMPOUND_EXPRESSION,
                                    children: [child],
                                };
                            }
                            currentContainer.children.push("+");
                            currentContainer.children.push(next);
                            children.splice(j, 1);
                            j--;
                        }
                        else {
                            currentContainer = undefined;
                            break;
                        }
                    }
                }
            }
        };
    }
}

// 统一出口-> transform ,codegen等模块处理
function baseCompile(template) {
    const ast = baseParse(template);
    transform(ast, {
        nodeTransforms: [transformExpression, transformElement, transformText],
    });
    return generate(ast);
}
// 运行模块和编译模块不能互相引用。

// mini-vue  出口
// {code}
function compilerToFunction(template) {
    const { code } = baseCompile(template);
    const render = new Function("Vue", code)(runtimeDom);
    return render;
    // code 为编译出来的
    //   "const { toDisplayString: _toDisplayString, createElementVNode: _createElementVNode } = Vue;
    // return function render(_ctx, _cache){return _createElementVNode(\\"\\"div\\"\\"), undefined,\\"div\\",null,'hi, '+_toDisplayString(_ctx.message))}"
    // `;
}
registerRuntimeCompiler(compilerToFunction);

exports.createApp = createApp;
exports.createElementVNode = createVNode;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.nextTick = nextTick;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.registerRuntimeCompiler = registerRuntimeCompiler;
exports.renderSlots = renderSlots;
exports.toDisplayString = toDisplayString;
