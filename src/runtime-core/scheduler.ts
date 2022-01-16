const queue: any = [];

let isFlushPending = false;
const p = Promise.resolve();
export function nextTick(fn) {
  return fn ? p.then(fn) : p;
}
export function queueJobs(job) {
  //
  if (!queue.includes(job)) {
    queue.push(job);
  }

  // 微任务
  queueFlush();
}

function queueFlush() {
  // 微任务
  if (isFlushPending) return;
  isFlushPending = true;
  nextTick(flushJobs);
  // Promise.resolve().then(() => {
  //   flushJobs();
  // });
}

function flushJobs() {
  isFlushPending = false;
  // 执行job
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
