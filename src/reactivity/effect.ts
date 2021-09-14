// 抽离概念
class ReactiveEffect {
  private _fn: any;
  constructor(fn) {
    this._fn = fn;
  }

  run() {
    // fn
    activeEffect = this;
    this._fn();
  }
}
const targetMap = new Map();
export function track(target, key) {
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
  dep.add(activeEffect);
}

let activeEffect;

export function effect(fn) {
  // fn

  const _effect = new ReactiveEffect(fn);
  // 调用run方法的时候直接执行fn
  _effect.run();
}

export function trigger(target, key) {
  // j基于 取出dep,调用所有fn
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of depsMap) {
    effect.run();
  }
}
