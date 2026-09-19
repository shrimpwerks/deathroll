import { useState } from 'react';
import { css, styled } from 'styled-components';
import LOSER_MESSAGES from './loserMessages';
import Header from './Header';
import History from './History';
import Shake from './Shake';
import { Tick, TickVariant } from './ticks';
import { Player, Turn, callout, dropRatio, hasGameStarted, isGameOver, nextMaxValue, previousTurnBy } from './Turn';
import { randomNumber, useSlotMachine } from './useSlotMachine';

const STARTING_VALUE = 100;

// The header starts having a cardiac event once the max drops below this.
const PANIC_BELOW = 10;
// At this max there is nothing left to do but pray.
const PRAY_AT_OR_BELOW = 2;

const VARIANT_STYLES: Record<TickVariant, ReturnType<typeof css>> = {
  normal: css``,
  danger: css`color: #dc3545;`,
  comic: css`font-family: "Comic Sans MS", "Comic Sans", cursive;`,
  impact: css`font-family: Impact, "Arial Black", sans-serif; letter-spacing: 0.05em;`,
  mono: css`font-family: "Courier New", monospace;`,
};

// Bootstrap's h1 tops out around 2.5rem. The roll is the whole point of the screen, so go big.
const RollValue = styled.h1<{ $variant: TickVariant }>`
  font-size: 7rem;
  font-weight: 700;
  line-height: 1;
  ${({ $variant }) => VARIANT_STYLES[$variant]}
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

  const latestIndex = history.length - 1;
  const latestTurn = latestIndex >= 0 ? history[latestIndex] : null;
  const latestCallout =
    latestTurn && !slot.rolling ? callout(latestTurn, previousTurnBy(history, latestIndex)) : null;

  const currentMax = hasGameStarted(history) ? nextMaxValue(history) : startingValue;
  const panic = hasGameStarted(history) && !isGameOver(history) && currentMax < PANIC_BELOW;

  function displayTick(): Tick {
    if (slot.rolling && slot.display !== null) {
      return slot.display;
    }
    return { text: String(currentMax), variant: 'normal' };
  }

  function rollButtonLabel(): string {
    if (startingValueError) {
      return startingValueError;
    }
    if (slot.rolling) {
      return "Rolling...";
    }
    if (hasGameStarted(history) && currentMax <= PRAY_AT_OR_BELOW) {
      return "Pray.";
    }
    return `Player ${currentPlayer} Roll!`;
  }

  return (
    <Shake px={shakePx} onDone={() => setShakePx(0)}>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col col-lg-6 layout">
            <Header spin={isGameOver(history)} panic={panic} />

            {isGameOver(history) && (
              <div className="mb-3">
                <div className="alert alert-danger loser" role="alert">
                  <span>{LOSER_MESSAGES[randomNumber(0, LOSER_MESSAGES.length)]}</span>
                </div>
              </div>
            )}

            {latestCallout && !isGameOver(history) && (
              <div className="mb-3">
                <div className="alert alert-warning text-center fw-bold" role="alert">
                  {latestCallout}
                </div>
              </div>
            )}

            <div className="m-5 d-flex justify-content-center">
              <RollValue
                $variant={displayTick().variant}
                inputMode='numeric'
                contentEditable={!hasGameStarted(history) && !slot.rolling}
                onBlur={e => onStartingValueChange(e)}
                suppressContentEditableWarning={true}
              >
                {displayTick().text}
              </RollValue>
            </div>

            <div className="mb-3">
              {isGameOver(history) ? (
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
