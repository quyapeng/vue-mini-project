import { effect } from "../effect";
import { reactive } from "../reactive";

describe("effect", () => {
  it.skip("happy path", () => {
    // 拆分
    const user = reactive({
      age: 10,
    });
    let nextAge;
    effect(() => {
      nextAge = user.age + 1;
    });
    expect(nextAge).toBe(11);
    // update
    user.age++;
    expect(nextAge).toBe(12);
  });

  it("should return runner when call effect", () => {
    // 1.effect(fn)-> function(runner) ->调用fn -> 并把返回值返回出来
    let foo = 10;
    const runner = effect(() => {
      foo++;
      return "foo";
    });
    expect(foo).toBe(10);
    const r = runner();
    expect(foo).toBe(11);
    expect(r).toBe("foo");
  });
});
