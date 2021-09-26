import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it("happy path", () => {
    // 拆分
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);
  });
});
