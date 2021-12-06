// const ShapeFlags = {
//   element: 0,
//   stateful_component: 0,
//   text_children: 0,
//   array_children: 0,
// };

// vnode flag?
// 1.设置/修改
// 2.查找类型

//

// if (ShapeFlags.element) {
//   // 是element
// }

// 当前数据结构为key:value的形式，不够高效，--> 位运算
// 0000
// 0001 --> element
// 0010 --> stateful
// 0100 --> text_children
// 1000 --> array_children

/****
 *
 * | 两位都为0，则为0
 * & 两位都为1，则为1
 *
// 修改

// 0000 -> 0001
 */

export const enum ShapeFlags {
  ELEMENT = 1, // 0001
  STATEFUL_COMPONENT = 1 << 1, // 0010
  TEXT_CHILDREN = 1 << 2, // 0100
  ARRAY_CHILDREN = 1 << 3, // 1000
}

console.log("ShapeFlags", ShapeFlags.STATEFUL_COMPONENT);
