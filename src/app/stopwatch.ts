/**
 * Simple stopwatch
 */
export function stopwatch() {
  let timeStart = new Date().getTime();
  return {
    /** <integer>s e.g 2s etc. */
    get seconds() {
      const seconds =
        Math.ceil((new Date().getTime() - timeStart) / 1000) + 's';
      return seconds;
    },
    /** Milliseconds e.g. 2000ms etc. */
    get ms() {
      const ms = new Date().getTime() - timeStart + 'ms';
      return ms;
    },
    reset() {
      timeStart = new Date().getTime();
    }
  };
}
