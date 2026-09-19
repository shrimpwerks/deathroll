import { css, keyframes, styled } from "styled-components";

const rotate = keyframes`
  from { 
    transform: rotate(0deg); 
  }

  to { 
    transform: rotate(360deg); 
  }
`;

// Two quick beats then a rest, like an actual heart that is not doing well.
const heartbeat = keyframes`
  0%, 100% { transform: scale(1); color: inherit; }
  14% { transform: scale(1.12); color: #dc3545; }
  28% { transform: scale(1); color: inherit; }
  42% { transform: scale(1.12); color: #dc3545; }
  70% { transform: scale(1); color: inherit; }
`;

const Title = styled.h1<{ $panic: boolean }>`
  ${({ $panic }) =>
    $panic &&
    css`
      animation: ${heartbeat} 1s ease-in-out infinite;
    `}
`;

interface SpinProps {
  $duration: number;
  $reverse?: boolean;
}

// inline-block so each emoji transforms around its own center
const Spinner = styled.span<SpinProps>`
  display: inline-block;
  animation: ${rotate} ${({ $duration }) => $duration}s linear
    ${({ $reverse }) => ($reverse ? "reverse" : "normal")} infinite;
`;

interface EmojiConfig {
  emoji: string;
  duration: number;
  reverse?: boolean;
}

const LEFT: EmojiConfig[] = [
  { emoji: "💀", duration: 3, reverse: true },
];

const RIGHT: EmojiConfig[] = [
  { emoji: "💀", duration: 3 },
];

function Emojis({ items, spin }: { items: EmojiConfig[]; spin: boolean }) {
  return (
    <div>
      {items.map(({ emoji, duration, reverse }, i) =>
        spin ? (
          <Spinner key={i} $duration={duration} $reverse={reverse}>
            {emoji}
          </Spinner>
        ) : (
          <span key={i}>{emoji}</span>
        ),
      )}
    </div>
  );
}

interface HeaderProps {
  spin: boolean;
  panic: boolean;
}

export default function Header({ spin, panic }: HeaderProps) {
  return (
    <Title $panic={panic} className={`m-4 d-flex justify-content-center gap-3`}>
      <Emojis items={LEFT} spin={spin} />
      Death Roll
      <Emojis items={RIGHT} spin={spin} />
    </Title>
  );
}
