import { useState } from 'react';
import LOSER_MESSAGES from './loserMessages';
import Header from './Header';
import History from './History';
import { Turn, hasGameStarted, isGameOver, nextMaxValue } from './Turn';

const STARTING_VALUE = 100;

function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * max) + min;
}

export default function App() {
  const [startingValue, setStartingValue] = useState(STARTING_VALUE);
  const [startingValueError, setStartingValueError] = useState<string | null>(null);
  const [history, setHistory] = useState<Turn[]>([]);

  function resetGame() {
    setHistory([]);
  }

  function rollDice() {
    const maxValue = hasGameStarted(history) ? nextMaxValue(history) : startingValue;
    const rand = randomNumber(1, maxValue);
    setHistory([...history, { roll: rand, maxRoll: maxValue }]);
  }

  function onStartingValueChange(e: any) {
    const n = Number(e.target.innerText);
    if (!Number.isNaN(n)) {
      setStartingValue(n);
      setStartingValueError(null);
    } else {
      setStartingValueError("Invalid starting value");
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col col-lg-6 layout">
          <Header spin={isGameOver(history)} />

          {isGameOver(history) && (
            <div className="mb-3">
              <div className="alert alert-danger loser" role="alert">
                <span>{LOSER_MESSAGES[randomNumber(0, LOSER_MESSAGES.length)]}</span>
              </div>
            </div>
          )}

          <div className="m-5 d-flex justify-content-center">
            <h1
              inputMode='numeric'
              contentEditable={!hasGameStarted(history)}
              onBlur={e => onStartingValueChange(e)}
              suppressContentEditableWarning={true}
            >
              {hasGameStarted(history) ? nextMaxValue(history) : startingValue}
            </h1>
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
                className="btn btn-primary btn-lg w-100 p-4"
                onClick={rollDice}
                disabled={startingValueError !== null}>
                {startingValueError ? startingValueError : "Roll!"}
              </button>
            )}
          </div>

          <History history={history} />
        </div>
      </div>
    </div>
  );
};