import { useEffect, useRef, useState } from 'react';
import { Tick, between, fakeMaxTick, nearMissTick, numberTick, randomTick } from './ticks';

// 0 when the max is comfortably large, 1 at a max of 2. Everything dramatic scales off this.
export function danger(maxValue: number): number {
  return Math.min(1, 2 / maxValue);
}

export function lerp(from: number, to: number, t: number) {
  return from + (to - from) * t;
}

// The fast flicker gets a bit longer as the stakes rise...
const FAST_PHASE_MS = { safe: 600, deadly: 1200 };
// ...and the crawl at the end turns into a drumroll: more steps, each slower than the last.
const CRAWL_FIRST_MS = 150;
const CRAWL_GROWTH = 1.4;
const CRAWL_STEPS = { safe: 3, deadly: 6 };

// The fake near-miss is a cheap trick. Save it for when a 1 would actually hurt.
const NEAR_MISS_CHANCE = { safe: 0.08, deadly: 0.4 };
const FAKE_MAX_CHANCE = 0.15;
// Per tick, while the button is held.
const HELD_NEAR_MISS_CHANCE = { safe: 0.005, deadly: 0.03 };

interface Step {
  delayMs: number;
  tick: Tick;
}

// Smaller max values flicker faster.
function fastTickMs(maxValue: number) {
  return Math.max(30, Math.min(120, maxValue));
}

function fastPhase(maxValue: number): Step[] {
  const d = danger(maxValue);
  const tickMs = fastTickMs(maxValue);
  const count = Math.floor(lerp(FAST_PHASE_MS.safe, FAST_PHASE_MS.deadly, d) / tickMs);
  const steps = Array.from({ length: count }, () => ({ delayMs: tickMs, tick: randomTick(maxValue) }));

  if (count > 4) {
    const gag = Math.random() < lerp(NEAR_MISS_CHANCE.safe, NEAR_MISS_CHANCE.deadly, d)
      ? nearMissTick()
      : Math.random() < FAKE_MAX_CHANCE ? fakeMaxTick(maxValue) : null;
    if (gag) {
      steps[between(2, count - 3)].tick = gag;
    }
  }

  return steps;
}

function heldTick(maxValue: number): Tick {
  const d = danger(maxValue);
  return Math.random() < lerp(HELD_NEAR_MISS_CHANCE.safe, HELD_NEAR_MISS_CHANCE.deadly, d)
    ? nearMissTick()
    : randomTick(maxValue);
}

// Real numbers only, slowing down until the final one lands.
function landing(maxValue: number, final: number): Step[] {
  const count = Math.round(lerp(CRAWL_STEPS.safe, CRAWL_STEPS.deadly, danger(maxValue)));
  const crawl = Array.from({ length: count }, (_, i) => ({
    delayMs: Math.round(CRAWL_FIRST_MS * CRAWL_GROWTH ** i),
    tick: numberTick(between(1, maxValue)),
  }));
  return [...crawl, { delayMs: 0, tick: numberTick(final) }];
}

// Flickers through nonsense before landing on a number.
//
// Two ways in: `roll` plays a fixed flicker then lands on its own. `hold` flickers
// until `release`, then lands. `cancel` bails out of either without rolling.
export function useSlotMachine(onLand: (roll: number, maxValue: number) => void) {
  const [display, setDisplay] = useState<Tick | null>(null);
  const [rolling, setRolling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const held = useRef<number | null>(null);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  useEffect(() => () => clearTimeout(timer.current), []);

  function playSteps(steps: Step[], onDone: () => void) {
    const run = (i: number) => {
      setDisplay(steps[i].tick);
      if (i === steps.length - 1) {
        onDone();
        return;
      }
      timer.current = setTimeout(() => run(i + 1), steps[i].delayMs);
    };
    run(0);
  }

  function land(maxValue: number) {
    const final = between(1, maxValue);
    playSteps(landing(maxValue, final), () => {
      setRolling(false);
      setDisplay(null);
      onLandRef.current(final, maxValue);
    });
  }

  function roll(maxValue: number) {
    clearTimeout(timer.current);
    held.current = null;
    setRolling(true);
    playSteps(fastPhase(maxValue), () => land(maxValue));
  }

  function hold(maxValue: number) {
    clearTimeout(timer.current);
    held.current = maxValue;
    setRolling(true);
    const tickMs = fastTickMs(maxValue);
    const loop = () => {
      setDisplay(heldTick(maxValue));
      timer.current = setTimeout(loop, tickMs);
    };
    loop();
  }

  function release() {
    if (held.current === null) {
      return;
    }
    clearTimeout(timer.current);
    const maxValue = held.current;
    held.current = null;
    land(maxValue);
  }

  function cancel() {
    clearTimeout(timer.current);
    held.current = null;
    setRolling(false);
    setDisplay(null);
  }

  return { rolling, display, roll, hold, release, cancel };
}
