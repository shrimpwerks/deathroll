import { useCallback, useEffect, useState } from 'react';
import { css, keyframes, styled } from 'styled-components';

type HoldState = 'idle' | 'holding' | 'armed';

const pulse = keyframes`
  from { transform: scale(1); }
  to { transform: scale(1.03); }
`;

// Long-press on mobile pops a context menu and selects text unless told not to.
const Button = styled.button<{ $armed: boolean }>`
  position: relative;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  touch-action: manipulation;
  ${({ $armed }) =>
    $armed &&
    css`
      animation: ${pulse} 0.4s ease-in-out infinite alternate;
    `}
`;

// Sweeps left to right over the hold duration. Snaps back instantly on release.
const Fill = styled.span<{ $active: boolean; $holdMs: number }>`
  position: absolute;
  inset: 0;
  width: ${({ $active }) => ($active ? '100%' : '0')};
  background: rgba(0, 0, 0, 0.18);
  transition: width ${({ $active, $holdMs }) => ($active ? $holdMs : 0)}ms linear;
  pointer-events: none;
`;

const Label = styled.span`
  position: relative;
`;

interface HoldButtonProps {
  className?: string;
  // How long the button must be held before letting go counts as a roll.
  holdMs: number;
  // True while a roll is landing. Disables the button until it's done.
  busy: boolean;
  labels: Record<HoldState | 'busy', string>;
  onHoldStart: () => void;
  // `armed` is false when the player let go too early.
  onRelease: (armed: boolean) => void;
}

export default function HoldButton({ className, holdMs, busy, labels, onHoldStart, onRelease }: HoldButtonProps) {
  const [state, setState] = useState<HoldState>('idle');

  function begin() {
    if (busy || state !== 'idle') {
      return;
    }
    setState('holding');
    onHoldStart();
  }

  const release = useCallback(() => {
    if (state === 'idle') {
      return;
    }
    onRelease(state === 'armed');
    setState('idle');
  }, [state, onRelease]);

  useEffect(() => {
    if (state !== 'holding') {
      return;
    }
    const timer = setTimeout(() => setState('armed'), holdMs);
    return () => clearTimeout(timer);
  }, [state, holdMs]);

  // Fingers slide off buttons. Listen everywhere while held.
  useEffect(() => {
    if (state === 'idle') {
      return;
    }
    window.addEventListener('pointerup', release);
    window.addEventListener('pointercancel', release);
    window.addEventListener('blur', release);
    return () => {
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
      window.removeEventListener('blur', release);
    };
  }, [state, release]);

  function isHoldKey(e: React.KeyboardEvent) {
    return e.key === ' ' || e.key === 'Enter';
  }

  const label = busy && state === 'idle' ? labels.busy : labels[state];

  return (
    <Button
      type="button"
      className={className}
      $armed={state === 'armed'}
      disabled={busy && state === 'idle'}
      onPointerDown={e => e.button === 0 && begin()}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => {
        if (isHoldKey(e)) {
          e.preventDefault();
          if (!e.repeat) {
            begin();
          }
        }
      }}
      onKeyUp={e => isHoldKey(e) && release()}
    >
      <Fill $active={state !== 'idle'} $holdMs={holdMs} />
      <Label>{label}</Label>
    </Button>
  );
}
