import { hasOwn } from "../shared/index";

const publicProprttiesMap = {
  $el: (i) => i.vnode.el,
};

export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    // key -> msg
    // setupState
    const { setupState, props } = instance;
    if (key in setupState) {
      return setupState[key];
    }

    if (hasOwn(setupState, key)) {
      return setupState[key];
    } else if (hasOwn(props, key)) {
      return props[key];
    }

    // key -> $el  $data,
    // if (key === "$el") {
    //   return instance.vnode.$el;
    // }
    //
    const publicGetter = publicProprttiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }
  },
  // {
  //   get(target, key) {
  //     // key -> msg
  //     // setupState
  //     const { setupState } = instance;
  //     if (key in setupState) {
  //       return setupState[key];
  //     }

  //     // key -> $el
  //     if (key === "$el") {
  //       return instance.vnode.$el;
  //     }
  //   },
  // }
};
