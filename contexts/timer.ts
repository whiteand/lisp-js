import { createContext } from "../di/createContext.ts";
import { doNothing } from "../utils/doNothing.ts";

interface Timer {
  finished(step: string): void;
  reset(): void;
}

export const NO_TIMER = {
  reset: doNothing,
  finished: doNothing,
};

export const ACTUAL_TIMER = {
  lastTime: 0,
  reset() {
    this.lastTime = performance.now();
  },
  finished(step: string): void {
    const now = performance.now();
    const delta = now - this.lastTime;
    console.log(`${step} took ${delta}ms`);
    this.lastTime = performance.now();
  },
};

export const TimerContext = createContext<Timer>(NO_TIMER);
