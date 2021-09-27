// export function extend(effect, options) {
//     Object.assign(effect, options);
//   }
export const extend = Object.assign;

export const isObject = (val) => {
  return val !== null && typeof val === "object";
};
