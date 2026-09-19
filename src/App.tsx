import { useState } from 'react';
import { styled } from 'styled-components';
import LOSER_MESSAGES from './loserMessages';
import Header from './Header';
import History from './History';
import Shake from './Shake';
import { Player, Turn, callout, dropRatio, hasGameStarted, isGameOver, nextMaxValue } from './Turn';
import { randomNumber, useSlotMachine } from './useSlotMachine';

const STARTING_VALUE = 100;

// Bootstrap's h1 tops out around 2.5rem. The roll is the whole point of the screen, so go big.
const RollValue = styled.h1`
  font-size: 7rem;
  font-weight: 700;
  line-height: 1;
`;

// Always reserves two lines, even when empty, so the roll button never shifts.
// Loser messages can wrap on narrow screens; callouts fit on one.
const Callout = styled.p<{ $visible: boolean; $tone: "warning" | "danger" }>`
  min-height: 3rem;
  margin: 0.5rem 0 0;
  text-align: center;
  font-weight: 700;
  color: ${({ $tone }) => `var(--bs-${$tone})`};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 150ms ease-in;
`;

// Any roll that loses more than 90% of the max shakes the screen.
const SHAKE_THRESHOLD = 0.9;
const MAX_SHAKE_PX = 40;

function shakeAmplitude(turn: Turn): number {
  const excess = dropRatio(turn) - SHAKE_THRESHOLD;
  if (excess <= 0) {
    return 0;
  }
  // 0.9 -> 0px, 0.99 -> ~36px, 1.0 -> 40px
  return Math.round((excess / (1 - SHAKE_THRESHOLD)) * MAX_SHAKE_PX);
}

export default function App() {
  const [startingValue, setStartingValue] = useState(STARTING_VALUE);
  const [startingValueError, setStartingValueError] = useState<string | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);
  const [shakePx, setShakePx] = useState(0);

  const currentPlayer: Player = history.length % 2 === 0 ? 1 : 2;
  const rollButtonClass = currentPlayer === 1 ? "btn-warning" : "btn-info";

  const slot = useSlotMachine((roll, maxRoll) => {
    const turn: Turn = { player: currentPlayer, roll, maxRoll };
    setHistory(history => [...history, turn]);
    setShakePx(shakeAmplitude(turn));
  });

  function resetGame() {
    setHistory([]);
    setShakePx(0);
  }

  function rollDice() {
    const maxValue = hasGameStarted(history) ? nextMaxValue(history) : startingValue;
    slot.start(maxValue);
  }

  function onStartingValueChange(e: React.FocusEvent<HTMLElement>) {
    const n = Number(e.currentTarget.innerText);
    if (!Number.isNaN(n)) {
      setStartingValue(n);
      setStartingValueError(null);
    } else {
      setStartingValueError("Invalid starting value");
    }
  }

  const latestTurn = history.length > 0 ? history[history.length - 1] : null;
  const gameOver = isGameOver(history);
  const message = gameOver
    ? LOSER_MESSAGES[randomNumber(0, LOSER_MESSAGES.length)]
    : latestTurn && !slot.rolling ? callout(latestTurn) : null;

  function displayValue(): number {
    if (slot.rolling && slot.display !== null) {
      return slot.display;
    }
    return hasGameStarted(history) ? nextMaxValue(history) : startingValue;
  }

  function rollButtonLabel(): string {
    if (startingValueError) {
      return startingValueError;
    }
    if (slot.rolling) {
      return "Rolling...";
    }
    return `Player ${currentPlayer} Roll!`;
  }

  return (
    <Shake px={shakePx} onDone={() => setShakePx(0)}>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col col-lg-6 layout">
            <Header spin={gameOver} />

            <div className="m-5 d-flex flex-column align-items-center">
              <RollValue
                inputMode='numeric'
                contentEditable={!hasGameStarted(history) && !slot.rolling}
                onBlur={e => onStartingValueChange(e)}
                suppressContentEditableWarning={true}
              >
                {displayValue()}
              </RollValue>
              <Callout
                $visible={message !== null}
                $tone={gameOver ? "danger" : "warning"}
                aria-live="polite"
              >
                {message ?? ""}
              </Callout>
            </div>

            <div className="mb-3">
              {gameOver ? (
                <button
                  className="btn btn-danger btn-lg w-100 p-4"
                  onClick={resetGame}
                >
                  Reset Game
                </button>
              ) : (
                <button
                  className={`btn ${rollButtonClass} btn-lg w-100 p-4`}
                  onClick={rollDice}
                  disabled={startingValueError !== null || slot.rolling}>
                  {rollButtonLabel()}
                </button>
              )}
            </div>

            <History history={history} />
          </div>
        </div>
      </div>
    </Shake>
  );
};
