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
    `}
`;

interface ShakeProps {
  // 0 means no shake. Otherwise the pixel amplitude.
  px: number;
  onDone: () => void;
  children: ReactNode;
}

export default function Shake({ px, onDone, children }: ShakeProps) {
  return (
    <Shaker $px={px} onAnimationEnd={onDone}>
      {children}
    </Shaker>
  );
}
