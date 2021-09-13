import { add } from "../index";

it("init", () => {
  expect(add(1, 1)).toBe(2);
});
// nodejs 下默认的模块规范是common
