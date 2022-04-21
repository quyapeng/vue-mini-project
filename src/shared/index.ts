// export function extend(effect, options) {
//     Object.assign(effect, options);
//   }
export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const isString = (val) => typeof val === "string";

export const hasChanged = (value, newValue) => {
  // 如果相等，则未改变，如果不相等，则为已改变
  return !Object.is(value, newValue);
};

export const hasOwn = (val, key) =>
  Object.prototype.hasOwnProperty.call(val, key);

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
// 转换为驼峰命名规范
export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : "";
  });
};

export const toHandlerKey = (str: string) => {
  return str ? "on" + capitalize(str) : "";
};
