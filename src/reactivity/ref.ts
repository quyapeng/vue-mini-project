import { reactive } from "./reactive";
import { trackEffect, triggerEffect, isTracking } from "./effect";
import { hasChanged, isObject } from "./shared";

// ref是一个单值，1 true '2'
// proxy针对 object
//

// ref impl  接口缩写
class refImpl {
  private _value: any;
  // 原始值
  private _rawValue: any;
  public dep;
  constructor(value) {
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
export function ref(value) {
  return new refImpl(value);
}
