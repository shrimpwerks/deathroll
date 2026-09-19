import { useState } from 'react';
import { css, keyframes, styled } from 'styled-components';
import LOSER_MESSAGES from './loserMessages';
import Header from './Header';
import History from './History';
import HoldButton from './HoldButton';
import Shake from './Shake';
import { buzz, deathBuzz } from './haptics';
import { Tick, TickVariant, pick } from './ticks';
import {
  BIG_DROP_RATIO,
  Player,
  Turn,
  callout,
  dropRatio,
  hasGameStarted,
  isGameOver,
  nextMaxValue,
  otherPlayer,
  previousTurnBy,
} from './Turn';
import { danger, lerp, useSlotMachine } from './useSlotMachine';

const STARTING_VALUE = 100;

// Below this max the header has a cardiac event and the roll button has to be held down.
const DANGER_BELOW = 10;
// At this max there is nothing left to do but pray.
const PRAY_AT_OR_BELOW = 2;
// How long the button must be held. Scales with how likely the next roll is to kill you.
const HOLD_MS = { safe: 700, deadly: 2500 };

// Shake animation, then the drain and the fall start together.
const SHAKE_MS = 600;

// How red the background gets at the deadliest max, as a percentage mixed into the body colour.
const MAX_HEAT_PCT = 45;

type Tone = 'warning' | 'danger' | 'muted';

// The display face is the default. Each other variant is a deliberate departure from it.
const VARIANT_STYLES: Record<TickVariant, ReturnType<typeof css>> = {
  normal: css``,
  danger: css`
    color: var(--bs-danger);
  `,
  comic: css`
    font-family: 'Comic Sans MS', 'Comic Sans', cursive;
  `,
  impact: css`
    font-family: Impact, 'Arial Black', sans-serif;
    letter-spacing: 0.05em;
  `,
  mono: css`
    font-family: 'Courier New', monospace;
  `,
};

// Wobbles, then drops off the bottom of the screen.
const fall = keyframes`
  0% { transform: none; opacity: 1; }
  15% { transform: rotate(-6deg) translateY(4px); }
  30% { transform: rotate(5deg); }
  45% { transform: rotate(-3deg) translateY(2px); opacity: 1; }
  100% { transform: translateY(80vh) rotate(30deg); opacity: 0; }
`;

const rise = keyframes`
  from { transform: translateY(0.5rem); opacity: 0; }
  to { transform: none; opacity: 1; }
`;

// The roll is the whole point of the screen, so go big. The display face is condensed, which
// buys another couple of rem. Tabular figures stop the width jumping between 100, 65 and 7.
const RollValue = styled.h1<{ $variant: TickVariant; $color: string; $falling: boolean; $fallen: boolean }>`
  margin: 0;
  font-family: var(--font-display);
  font-size: 9rem;
  font-weight: 400;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: ${({ $color }) => $color};
  transition: color 300ms ease-out;
  ${({ $variant }) => VARIANT_STYLES[$variant]}
  ${({ $falling }) =>
    $falling &&
    css`
      animation: ${fall} 1.6s ease-in ${SHAKE_MS}ms forwards;
    `}
  ${({ $fallen }) =>
    $fallen &&
    css`
      animation: ${rise} 0.4s ease-out;
    `}
`;

// Always reserves two lines, even when empty, so the roll button never shifts.
// Loser messages can wrap on narrow screens; callouts fit on one.
const Callout = styled.p<{ $visible: boolean; $tone: Tone }>`
  min-height: 3rem;
  margin: 0.5rem 0 0;
  text-align: center;
  font-weight: ${({ $tone }) => ($tone === 'muted' ? 400 : 700)};
  color: ${({ $tone }) => ($tone === 'muted' ? 'var(--bs-secondary-color)' : `var(--bs-${$tone})`)};
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 150ms ease-in;
`;

// The colour drains out of the page once someone dies. Waits for the shake to finish first,
// and snaps straight back on rematch. Before that, the page warms toward red as death gets close.
const Drain = styled.div<{ $dead: boolean; $heat: number }>`
  min-height: 100dvh;
  background: color-mix(
    in srgb,
    var(--bs-body-bg),
    #8a1020 ${({ $heat }) => Math.round($heat * MAX_HEAT_PCT)}%
  );
  filter: grayscale(${({ $dead }) => ($dead ? 1 : 0)});
  transition: ${({ $dead }) => ($dead ? `filter 2s ease-in ${SHAKE_MS}ms` : 'background 600ms ease-out')};
`;

// Header up top, roll in the middle, button in reach of a thumb, history trailing off below.
const Screen = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
`;

const Stage = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
`;

const MAX_SHAKE_PX = 40;

// Any roll that loses more than 90% of the max shakes the screen. Dying shakes it as hard as it goes.
function shakeAmplitude(turn: Turn): number {
  if (turn.roll === 1) {
    return MAX_SHAKE_PX;
  }
  const excess = dropRatio(turn) - BIG_DROP_RATIO;
  if (excess <= 0) {
    return 0;
  }
  // 0.9 -> 0px, 0.99 -> ~36px
  return Math.round((excess / (1 - BIG_DROP_RATIO)) * MAX_SHAKE_PX);
}

function playerColor(player: Player): string {
  return `var(--player-${player})`;
}

export default function App() {
  const [startingValue, setStartingValue] = useState(STARTING_VALUE);
  const [startingValueError, setStartingValueError] = useState<string | null>(null);
  const [firstPlayer, setFirstPlayer] = useState<Player>(1);
  const [history, setHistory] = useState<Turn[]>([]);
  const [shakePx, setShakePx] = useState(0);
  // Picked once at death. Computing it in render made it change whenever anything re-rendered.
  const [loserMessage, setLoserMessage] = useState<string | null>(null);
  const [fallen, setFallen] = useState(false);
  const [chickenedOut, setChickenedOut] = useState(false);

  const currentPlayer: Player = history.length % 2 === 0 ? firstPlayer : otherPlayer(firstPlayer);
  const rollButtonClass = `btn btn-player-${currentPlayer} btn-lg w-100 p-4`;

  const slot = useSlotMachine((roll, maxRoll) => {
    const turn: Turn = { player: currentPlayer, roll, maxRoll };
    const px = shakeAmplitude(turn);
    setHistory((history) => [...history, turn]);
    setShakePx(px);
    if (roll === 1) {
      setLoserMessage(pick(LOSER_MESSAGES));
      deathBuzz();
    } else {
      buzz(px);
    }
  });

  const latestIndex = history.length - 1;
  const latestTurn = latestIndex >= 0 ? history[latestIndex] : null;
  const started = hasGameStarted(history);
  const gameOver = isGameOver(history);
  const currentMax = started ? nextMaxValue(history) : startingValue;
  const inDanger = started && !gameOver && currentMax < DANGER_BELOW;
  const heat = inDanger ? danger(currentMax) : 0;

  // The loser rolls first next time.
  function rematch() {
    if (latestTurn) {
      setFirstPlayer(latestTurn.player);
    }
    setHistory([]);
    setShakePx(0);
    setLoserMessage(null);
    setFallen(false);
    setChickenedOut(false);
  }

  function rollDice() {
    setChickenedOut(false);
    slot.roll(currentMax);
  }

  function startHolding() {
    setChickenedOut(false);
    slot.hold(currentMax);
  }

  function stopHolding(armed: boolean) {
    if (armed) {
      slot.release();
    } else {
      slot.cancel();
      setChickenedOut(true);
    }
  }

  function onStartingValueChange(e: React.FocusEvent<HTMLElement>) {
    const n = Number(e.currentTarget.innerText);
    if (!Number.isNaN(n)) {
      setStartingValue(n);
      setStartingValueError(null);
    } else {
      setStartingValueError('Invalid starting value');
    }
  }

  // Nothing has happened yet, so fill the slot with something quiet but useful.
  function idleMessage(): string {
    if (!started) {
      return 'Tap the number to set the stakes.';
    }
    if (currentMax <= 1) {
      return 'Nowhere left to go.';
    }
    return `1 in ${currentMax} to die.`;
  }

  function message(): { text: string; tone: Tone } | null {
    if (gameOver) {
      return loserMessage ? { text: loserMessage, tone: 'danger' } : null;
    }
    if (slot.rolling) {
      return null;
    }
    if (chickenedOut) {
      return { text: 'Chickened out.', tone: 'warning' };
    }
    const shout = latestTurn ? callout(latestTurn, previousTurnBy(history, latestIndex)) : null;
    if (shout) {
      return { text: shout, tone: 'warning' };
    }
    return { text: idleMessage(), tone: 'muted' };
  }

  function displayTick(): Tick {
    if (slot.rolling && slot.display !== null) {
      return slot.display;
    }
    if (gameOver) {
      return { text: fallen ? '🪦' : '1', variant: 'danger' };
    }
    return { text: String(currentMax), variant: 'normal' };
  }

  function rollButtonLabel(): string {
    if (startingValueError) {
      return startingValueError;
    }
    if (slot.rolling) {
      return 'Rolling...';
    }
    return `Player ${currentPlayer} Roll!`;
  }

  function rollButton() {
    if (gameOver) {
      return (
        <button className="btn btn-danger btn-lg w-100 p-4 fw-bold" onClick={rematch}>
          Rematch. Player {latestTurn?.player} rolls first.
        </button>
      );
    }

    if (inDanger) {
      return (
        <HoldButton
          className={rollButtonClass}
          holdMs={Math.round(lerp(HOLD_MS.safe, HOLD_MS.deadly, danger(currentMax)))}
          busy={slot.rolling}
          labels={{
            idle: currentMax <= PRAY_AT_OR_BELOW ? 'Hold. Pray.' : `Player ${currentPlayer}: hold to roll.`,
            holding: "Don't let go...",
            armed: 'Let go.',
            busy: 'Rolling...',
          }}
          onHoldStart={startHolding}
          onRelease={stopHolding}
        />
      );
    }

    return (
      <button
        className={rollButtonClass}
        onClick={rollDice}
        disabled={startingValueError !== null || slot.rolling}
      >
        {rollButtonLabel()}
      </button>
    );
  }

  const tick = displayTick();
  const text = message();
  // Whoever is about to roll owns the number. Nonsense ticks and death keep their own colours.
  const rollColor = tick.variant === 'normal' && !gameOver ? playerColor(currentPlayer) : 'inherit';

  return (
    <Drain $dead={gameOver} $heat={heat}>
      <Shake px={shakePx} onDone={() => setShakePx(0)}>
        <div className="container">
          <div className="row justify-content-md-center">
            <Screen className="col col-lg-6">
              <Header spin={gameOver} panic={inDanger} />

              <Stage>
                <RollValue
                  $variant={tick.variant}
                  $color={rollColor}
                  $falling={gameOver && !fallen}
                  $fallen={fallen}
                  onAnimationEnd={() => gameOver && !fallen && setFallen(true)}
                  inputMode="numeric"
                  contentEditable={!started && !slot.rolling}
                  onBlur={(e) => onStartingValueChange(e)}
                  suppressContentEditableWarning={true}
                >
                  {tick.text}
                </RollValue>
                <Callout $visible={text !== null} $tone={text?.tone ?? 'muted'} aria-live="polite">
                  {text?.text ?? ''}
                </Callout>
              </Stage>

              <div className="mb-3">{rollButton()}</div>

              <div className="pb-4">
                <History history={history} />
              </div>
            </Screen>
          </div>
        </div>
      </Shake>
    </Drain>
  );
}
