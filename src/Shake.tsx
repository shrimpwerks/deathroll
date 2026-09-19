import { ReactNode } from 'react';
import { css, keyframes, styled } from 'styled-components';

const shake = (px: number) => keyframes`
  0%, 100% { transform: translate(0, 0) rotate(0); }
  10% { transform: translate(${-px}px, ${px / 2}px) rotate(${-px / 4}deg); }
  20% { transform: translate(${px}px, ${-px / 2}px) rotate(${px / 4}deg); }
  30% { transform: translate(${-px}px, ${px / 3}px) rotate(${-px / 5}deg); }
  40% { transform: translate(${px}px, ${-px / 3}px) rotate(${px / 5}deg); }
  50% { transform: translate(${-px / 2}px, ${px / 4}px) rotate(${-px / 8}deg); }
  60% { transform: translate(${px / 2}px, ${-px / 4}px) rotate(${px / 8}deg); }
  70% { transform: translate(${-px / 4}px, 0) rotate(0); }
  80% { transform: translate(${px / 4}px, 0) rotate(0); }
  90% { transform: translate(${-px / 8}px, 0) rotate(0); }
`;

const Shaker = styled.div<{ $px: number }>`
  ${({ $px }) =>
    $px > 0 &&
    css`
      animation: ${shake($px)} 0.6s ease-out 1;
      filter: url(#aberration);
    `}
`;

// Splits the red and blue channels apart so the shaken frame looks like a busted CRT.
function Aberration({ dx }: { dx: number }) {
  const red = '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0';
  const green = '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0';
  const blue = '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0';
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <filter id="aberration" x="-5%" y="-5%" width="110%" height="110%">
        <feColorMatrix in="SourceGraphic" type="matrix" values={red} result="r" />
        <feOffset in="r" dx={-dx} dy="0" result="rOff" />
        <feColorMatrix in="SourceGraphic" type="matrix" values={green} result="g" />
        <feColorMatrix in="SourceGraphic" type="matrix" values={blue} result="b" />
        <feOffset in="b" dx={dx} dy="0" result="bOff" />
        <feBlend in="rOff" in2="g" mode="screen" result="rg" />
        <feBlend in="rg" in2="bOff" mode="screen" />
      </filter>
    </svg>
  );
}

interface ShakeProps {
  // 0 means no shake. Otherwise the pixel amplitude.
  px: number;
  onDone: () => void;
  children: ReactNode;
}

export default function Shake({ px, onDone, children }: ShakeProps) {
  return (
    <>
      <Aberration dx={Math.max(2, Math.round(px / 6))} />
      <Shaker $px={px} onAnimationEnd={onDone}>
        {children}
      </Shaker>
    </>
  );
}
