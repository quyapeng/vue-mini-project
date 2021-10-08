import { computed } from "../computed";
import { reactive } from "../reactive";

describe("computed", () => {
  it("happy path", () => {
    // 拆分
    const user = reactive({
      age: 1,
    });
    const age = computed(() => {
      return user.age;
    });
    expect(age.value).toBe(1);
  });

  it("should compute lazily", () => {
    const value = reactive({
      foo: 1,
    });
    // 是否调用getter
    const getter = jest.fn(() => {
      return value.foo;
    });
    const cValue = computed(getter);

    expect(getter).not.toHaveBeenCalled();
    // 下面调用了cValue.value,此时调用了getter
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    //
    // should not computed again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);
    // should not compute until needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);
    // now is should computed
    expect(cValue.value).toBe(2);
    expect(getter).toHaveBeenCalledTimes(2);
    // should not computed again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });
});
