import { extend } from "./shared";
let activeEffect;
let shouldTrack;

// 抽离概念
class ReactiveEffect {
  private _fn: any;
  deps = [];
  active = true;
  onStop?: () => void;
  // 外部直接获取到scheduler ,则使用public
  constructor(fn, public scheduler?) {
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
      if (this.onStop) this.onStop();
      this.active = false;
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  });
  effect.deps.length = 0;
}
const targetMap = new Map();
export function track(target, key) {
  if (!isTracking()) return;

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
  //如果已经有了，就不在添加
  if (dep.has(activeEffect)) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

function isTracking() {
  return activeEffect && shouldTrack;
}

export function trigger(target, key) {
  // 基于 取出dep,调用所有fn
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    // console.log("effect", effect);
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler);
  // _effect.onStop = options.onStop;
  extend(_effect, options);

  _effect.run();
  // 调用run方法的时候直接执行fn
  let runner: any = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner) {
  //
  runner.effect.stop();
}
