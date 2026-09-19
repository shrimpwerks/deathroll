import { useEffect, useRef, useState } from 'react';

const ROLL_DURATION_MS = 1000;

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

interface Spin {
  maxValue: number;
  final: number;
}

// Flickers through random values for a second before landing on `final`.
// Smaller max values tick faster, so the end of the game gets frantic.
export function useSlotMachine(onLand: (roll: number, maxValue: number) => void) {
  const [spin, setSpin] = useState<Spin | null>(null);
  const [display, setDisplay] = useState<number | null>(null);
  const onLandRef = useRef(onLand);
  onLandRef.current = onLand;

  useEffect(() => {
    if (!spin) {
      return;
    }

    const { maxValue, final } = spin;
    const tickMs = Math.max(30, Math.min(120, maxValue));
    const startedAt = Date.now();

    setDisplay(randomNumber(1, maxValue));
    const id = setInterval(() => {
      if (Date.now() - startedAt >= ROLL_DURATION_MS) {
        clearInterval(id);
        setSpin(null);
        setDisplay(null);
        onLandRef.current(final, maxValue);
        return;
      }
      setDisplay(randomNumber(1, maxValue));
    }, tickMs);

    return () => clearInterval(id);
  }, [spin]);

  return {
    rolling: spin !== null,
    display,
    start: (maxValue: number) => setSpin({ maxValue, final: randomNumber(1, maxValue) }),
  };
}
