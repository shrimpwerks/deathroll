import { useEffect, useRef, useState } from 'react';
import { Tick, fakeMaxTick, nearMissTick, numberTick, randomTick } from './ticks';

// Fast flicker, then a crawl, then the landing.
const FAST_PHASE_MS = 700;
const CRAWL_DELAYS_MS = [150, 250, 400];

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

interface Spin {
  maxValue: number;
  final: number;
}

interface Step {
  delayMs: number;
  tick: Tick;
}

// One-off gags get a guaranteed slot so every roll has at least one weird moment.
function fastPhase(maxValue: number): Step[] {
  const tickMs = Math.max(30, Math.min(120, maxValue));
  const count = Math.floor(FAST_PHASE_MS / tickMs);
  const steps = Array.from({ length: count }, () => ({ delayMs: tickMs, tick: randomTick(maxValue) }));

  if (count > 4) {
    const gag = Math.random() < 0.5 ? nearMissTick() : fakeMaxTick(maxValue);
    steps[randomNumber(2, count - 3)].tick = gag;
  }

  return steps;
}

function buildSequence(maxValue: number, final: number): Step[] {
  const crawl = CRAWL_DELAYS_MS.map(delayMs => ({ delayMs, tick: numberTick(randomNumber(1, maxValue)) }));
  const landing = { delayMs: 0, tick: numberTick(final) };
  return [...fastPhase(maxValue), ...crawl, landing];
}

// Flickers through nonsense before landing on `final`.
// Smaller max values tick faster, so the end of the game gets frantic.
export function useSlotMachine(onLand: (roll: number, maxValue: number) => void) {
  const [spin, setSpin] = useState<Spin | null>(null);
  const [display, setDisplay] = useState<Tick | null>(null);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  useEffect(() => {
    if (!spin) {
      return;
    }

    const { maxValue, final } = spin;
    const steps = buildSequence(maxValue, final);
    let timer: ReturnType<typeof setTimeout>;

    const run = (i: number) => {
      const step = steps[i];
      setDisplay(step.tick);
      if (i === steps.length - 1) {
        setSpin(null);
        setDisplay(null);
        onLandRef.current(final, maxValue);
        return;
      }
      timer = setTimeout(() => run(i + 1), step.delayMs);
    };

    run(0);
    return () => clearTimeout(timer);
  }, [spin]);

  return {
    rolling: spin !== null,
    display,
    start: (maxValue: number) => setSpin({ maxValue, final: randomNumber(1, maxValue) }),
  };
}
