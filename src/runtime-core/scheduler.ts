const queue: any = [];

let isFlushPending = false;
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
  Promise.resolve().then(() => {
    isFlushPending = false;
    // 执行job
    let job;
    while ((job = queue.shift())) {
      job && job();
    }
  });
}
