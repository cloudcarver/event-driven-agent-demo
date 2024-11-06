async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// This function will run and wait for the async function f, then sleep for ms milliseconds before running f again.
async function runAndSleep(f: () => Promise<void>, ms: number) {
  while (true) {
    await f();
    await sleep(ms);
  }
}

export { sleep, runAndSleep };
