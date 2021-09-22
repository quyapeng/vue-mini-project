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

  it.skip("should return runner when call effect", () => {
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

  it("scheduler", () => {
    // 1. 通过 effect 的第二个参数给定的一个 scheduler 的 fn
    // 2. effect 第一次执行的时候 还会执行 fn
    // 3. 当 响应式对象 set update 不回执行 fn 而是执行 scheduler
    // 4. 如果当执行 runner 的时候，会再次星座 fn
    let dummy;
    let run: any;
    const scheduler = jest.fn(() => {
      // jest.fn 是创建mock函数最简单的方式，如果么有定义函数内部的实现，jest.fn则会返回undefined作为返回值
      run = runner;
    });
    const obj = reactive({ foo: 1 });
    const runner = effect(
      () => {
        dummy = obj.foo;
      },
      {
        scheduler,
      }
    );
    // toHaveBeenCalled用来判断mock函数是否被掉用过
    expect(scheduler).not.toHaveBeenCalled();
    console.log(dummy);
    expect(dummy).toBe(1);
    // should be c alled first trigger
    obj.foo++;
    console.log("dummy", dummy);
    //toHaveBeenCalledTimes 用来判断mock函数调用过几次
    expect(scheduler).toHaveBeenCalledTimes(1);
    // should not run yet
    expect(dummy).toBe(1);
    // manually run
    run();
    // should be run
    expect(dummy).toBe(2);
  });
});
