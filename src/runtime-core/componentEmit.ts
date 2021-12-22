export function emit(event) {
  console.log("event", event);
  return () => {};
}
