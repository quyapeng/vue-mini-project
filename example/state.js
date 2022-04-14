// 有限状态机
// 读取一组输入，然后根据这些输入来更改为不同的状态。
// abc
// ab[cd]
function test(string) {
  let startIndex, endIndex, i;
  let result = [];
  function waitForA(char) {
    if (char === "a") {
      startIndex = i;
      return waitForB;
    }
    return waitForA;
  }
  function waitForB(char) {
    if (char === "b") {
      return waitForC;
    }
    return waitForA;
  }
  function waitForC(char) {
    if (char === "c" || char === "d") {
      endIndex = i;
      return end;
    }
    return waitForA;
  }

  function end() {
    return end;
  }

  let currentState = waitForA;

  for (i = 0; i < string.length; i++) {
    currentState = currentState(string[i]);

    if (currentState == end) {
      console.log("index", startIndex, endIndex);
      //   return true;
      result.push({
        start: startIndex,
        end: endIndex,
      });
      currentState = waitForA;
    }
  }
  //   return false;
}

console.log(test("12abdansnabc"));
