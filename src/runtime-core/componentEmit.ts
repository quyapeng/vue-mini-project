import { camelize, toHandlerKey } from "../shared/index";

export function emit(instance, event, ...args) {
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
