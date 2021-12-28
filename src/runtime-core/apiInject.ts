// provide inject 跨层级

import { getCurrentInstance } from "./component";

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
export function provide(key, value) {
  // provide 存
  // key value
  const currentInstance: any = getCurrentInstance();
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

export function inject(key, defaultValue) {
  console.log("key", key);
  // inject 取
  const currentInstance: any = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    // console.log("inject", currentInstance);
    if (key in parentProvides) {
      return parentProvides[key];
    } else if (defaultValue) {
      if (typeof defaultValue === "function") {
        return defaultValue();
      }
      return defaultValue;
    }
  }
}
