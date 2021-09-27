import { isReactive, reactive } from "../reactive";

describe("reactive", () => {
  it.skip("happy path", () => {
    // 拆分
    const original = { foo: 1 };
    const observed = reactive(original);
    expect(observed).not.toBe(original);
    expect(observed.foo).toBe(1);
    expect(isReactive(observed)).toBe(true);
    expect(isReactive(original)).toBe(false);

    expect(isReactive(observed.foo)).toBe(true);
    // expect(isReactive(original.foo)).toBe(false);
  });
  //
  it("nested reactive", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = reactive(original);
    expect(isReactive(original)).toBe(false);
    expect(isReactive(original.nested)).toBe(false);

    expect(isReactive(observed.nested)).toBe(true);
    expect(isReactive(observed.array)).toBe(true);
    expect(isReactive(observed.array[0])).toBe(true);
  });
});
