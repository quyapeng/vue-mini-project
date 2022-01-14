export function shouldUpdateComponent(prevVNode, nextVNode) {
  // shouldUpdateComponent
  const { props: prevProp } = prevVNode;
  const { props: nextProp } = nextVNode;
  for (const key in nextProp) {
    // if (nextProp[key] !== prevProp[key]) {
    //   return true;
    // }
    return nextProp[key] !== prevProp[key];
  }
  return false;
}
