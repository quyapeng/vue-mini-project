import { readonly, isReadonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // readonly test
    //  不可以被set,只读
    const original = { foo: 1, bar: { baz: 1 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);

    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReadonly(original.bar)).toBe(false);
  });

  // 当调用set的时候给一个警告提示
  it("warn then call set", () => {
    // console.warn()
    // mock 假的请求，验证是否被调用到
    console.warn = jest.fn();
    const user = readonly({
      age: 10,
    });
    user.age = 11;

    expect(console.warn).toBeCalled(); // 是否被调用到
  });
});
