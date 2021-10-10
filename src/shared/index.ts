// export function extend(effect, options) {
//     Object.assign(effect, options);
//   }
export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};

export const hasChanged = (value, newValue) => {
  // 如果相等，则未改变，如果不相等，则为已改变
  return !Object.is(value, newValue);
};
