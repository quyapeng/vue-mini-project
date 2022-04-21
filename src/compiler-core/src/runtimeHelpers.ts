const name = "toDisplayString";
const element = "createElementVNode";

export const TO_DISPLAY_STRING = Symbol(name);
export const CREATE_ELEMENT_VNODE = Symbol(element);

export const helperMapName = {
  [TO_DISPLAY_STRING]: name,
  [CREATE_ELEMENT_VNODE]: element,
};
