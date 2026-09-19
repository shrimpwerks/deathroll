// What the big number shows on a single frame of the roll.

export type TickVariant =
  | 'normal'
  | 'danger' // the fake near-miss
  | 'comic'
  | 'impact'
  | 'mono';

export interface Tick {
  text: string;
  variant: TickVariant;
}

const WORDS = ['NICE', 'uh oh', '69', '∞', 'NaN', 'error', 'undefined', '???', 'no', 'lol'];
const EMOJI = ['💀', '🎲', '🤡', '🫠', '😬', '🙏', '💩', '🔥', '👀', '🫡', '🪦', '🤞'];
// Kept rare and to a few fonts. Every tick in a new face reads as broken, not funny.
const FONTS: TickVariant[] = ['comic', 'impact', 'mono'];
const UPSIDE_DOWN: Record<string, string> = {
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
};

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function between(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function toRoman(n: number): string {
  const table: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
    [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];
  let out = '';
  for (const [value, numeral] of table) {
    while (n >= value) {
      out += numeral;
      n -= value;
    }
  }
  return out;
}

function flip(n: number): string {
  return String(n).split('').reverse().map(d => UPSIDE_DOWN[d] ?? d).join('');
}

export function numberTick(n: number): Tick {
  return { text: String(n), variant: 'normal' };
}

// Flash a 1 in red for one frame.
export function nearMissTick(): Tick {
  return { text: '1', variant: 'danger' };
}

// Show a number that couldn't possibly be rolled, then move on like nothing happened.
export function fakeMaxTick(maxValue: number): Tick {
  return numberTick(between(maxValue * 5, maxValue * 50));
}

export function randomTick(maxValue: number): Tick {
  const n = between(1, maxValue);
  const r = Math.random();

  if (r < 0.07) {
    return { text: pick(WORDS), variant: 'normal' };
  }
  if (r < 0.1) {
    return { text: pick(EMOJI), variant: 'normal' };
  }
  if (r < 0.17) {
    return { text: flip(n), variant: 'normal' };
  }
  if (r < 0.24 && n < 4000) {
    return { text: toRoman(n), variant: 'normal' };
  }
  if (r < 0.29) {
    return { text: String(n), variant: pick(FONTS) };
  }
  return numberTick(n);
}
