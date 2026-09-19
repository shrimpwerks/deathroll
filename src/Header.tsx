import { css, keyframes, styled } from 'styled-components';

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Two quick beats then a rest, like an actual heart that is not doing well.
const heartbeat = keyframes`
  0%, 100% { transform: scale(1); color: inherit; }
  14% { transform: scale(1.12); color: var(--bs-danger); }
  28% { transform: scale(1); color: inherit; }
  42% { transform: scale(1.12); color: var(--bs-danger); }
  70% { transform: scale(1); color: inherit; }
`;

const Title = styled.h1<{ $panic: boolean }>`
  position: relative;
  display: inline-block;
  margin: 0;
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 400;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  line-height: 1;
  ${({ $panic }) =>
    $panic &&
    css`
      animation: ${heartbeat} 1s ease-in-out infinite;
    `}
`;

// Sits just off the end of the title so it can come and go without the text shifting.
const Skull = styled.span<{ $visible: boolean; $spin: boolean }>`
  position: absolute;
  left: 100%;
  top: 50%;
  margin-left: 0.5rem;
  translate: 0 -50%;
  font-size: 0.8em;
  letter-spacing: 0;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 300ms ease-in;
  ${({ $spin }) =>
    $spin &&
    css`
      animation: ${rotate} 3s linear infinite;
    `}
`;

interface HeaderProps {
  // Game over: the skull spins.
  spin: boolean;
  // Death is close: the title beats and the skull shows up.
  panic: boolean;
}

export default function Header({ spin, panic }: HeaderProps) {
  return (
    <div className="d-flex justify-content-center py-4">
      <Title $panic={panic}>
        Death Roll
        <Skull $visible={panic || spin} $spin={spin} aria-hidden="true">
          💀
        </Skull>
      </Title>
    </div>
  );
}
