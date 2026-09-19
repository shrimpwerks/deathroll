// No-ops where vibration isn't supported (desktop, iOS Safari).

function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // Some browsers throw without a user gesture. Not worth surfacing.
  }
}

// A single buzz proportional to how hard the screen is shaking.
export function buzz(px: number) {
  if (px > 0) {
    vibrate(Math.round(px * 4));
  }
}

// Two short, one long. A flatline.
export function deathBuzz() {
  vibrate([120, 60, 120, 60, 500]);
}
