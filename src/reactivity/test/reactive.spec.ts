import { reactive } from "../reactive";

describe("reactive", () => {
  it.skip("happy path", () => {
    // 拆分
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
  });
});
