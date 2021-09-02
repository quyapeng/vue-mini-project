//  响应式库
// 响应式核心：收集依赖，触发依赖

// 依赖
let currentEffect;

class Dep {
  // 1.收集依赖 ,effect收集依赖
  constructor(val) {
    // 收集的依赖存储在这里
    this.effects = new Set(); // 去除重复的收集
    this._val = val;
  }
  get value() {
    // 收集依赖
    this.depend();
    return this._val;
  }
  set value(newval) {
    this._val = newval;
    // 值更新完毕之后再去通知
    this.notice();
  }
  depend() {
    if (currentEffect) this.effects.add(currentEffect);
  }

  // 2.触发依赖
  notice() {
    // 触发一下之前收集到的依赖
    this.effects.forEach((e) => {
      e();
    });
  }
}

function effectWatch(effect) {
  // 收集依赖
  currentEffect = effect;
  effect();
  // dep.depend();
  currentEffect = null;
}
const dep = new Dep(10);
let b;
effectWatch(() => {
  console.log("effectWatch");
  b = dep.value + 10;
  console.log(dep);
});

// 值发生变化
dep.value = 20;
// dep.notice();
// dep ->单个值，
// object -> 单个key 是一个dep

// 1.这个对象在什么时候改变的
// object.a -> get
// object.a = 2 -> set

// vue2
// Object.defineProperty;定义改变属性， 属性描述符有get 和set 方法，属性要一个一个去处理，执行周期在初始化，性能消耗很大
// vue3 用的 proxy,一次拦截，不需要具体到每一个属性，执行一次，

function reactive(raw) {
  // 让我
  return new Proxy(raw, {
    get(target, key) {
      console.log("get", target, key);
      return Reflect.get(target, key);
    },
  });
}

const user = reactive({
  name: "tom",
  age: 19,
});
user.age;
