export const createRateLimiter = ({ limit, intervalMs }) => {
  const queue = [];
  let active = 0;

  const runNext = () => {
    if (queue.length === 0 || active >= limit) {
      return;
    }

    const { fn, resolve, reject } = queue.shift();
    active += 1;

    Promise.resolve()
      .then(fn)
      .then(resolve)
      .catch(reject)
      .finally(() => {
        setTimeout(() => {
          active = Math.max(active - 1, 0);
          runNext();
        }, intervalMs);
      });
  };

  return (fn) => {
    return new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      runNext();
    });
  };
};
