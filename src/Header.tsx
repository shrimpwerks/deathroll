import { keyframes, styled } from "styled-components";

const rotate = keyframes`
  from { 
    transform: rotate(0deg); 
  }

  to { 
    transform: rotate(360deg); 
  }
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
}

export default function Header({ spin }: HeaderProps) {
  return (
    <h1 className={`m-4 d-flex justify-content-center gap-3`}>
      <Emojis items={LEFT} spin={spin} />
      Death Roll
      <Emojis items={RIGHT} spin={spin} />
    </h1>
  );
}
