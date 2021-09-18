// 抽离概念
class ReactiveEffect {
  private _fn: any;
  // 外部直接获取到scheduler ,则使用public
  constructor(fn, public scheduler?) {
    this._fn = fn;
    // this.scheduler = scheduler;
  }

  run() {
    // fn
    activeEffect = this;
    // this._fn();
    return this._fn();
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
  dep.add();
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

let activeEffect;
export function effect(fn, options: any = {}) {
  // fn
  const _effect = new ReactiveEffect(fn, options.scheduler);
  _effect.run();
  // 调用run方法的时候直接执行fn
  let runner: any = _effect.run.bind(_effect);
  // runner.effect = _effect;
  return runner;
}
