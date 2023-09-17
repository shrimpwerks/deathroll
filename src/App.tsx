import { useState } from 'react';

const STARTING_VALUE = 100;

export default function App() {
  const [maxValue, setMaxValue] = useState(STARTING_VALUE);
  const [roll, setRoll] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);

  function resetGame() {
    setMaxValue(STARTING_VALUE);
    setRoll(0);
    setHistory([]);
    setGameOver(false);
  }

  function rollDice() {
    const rand = Math.floor(Math.random() * maxValue) + 1;

    setRoll(rand);
    setMaxValue(rand);
    setHistory([...history, `Rolled ${rand} (out of ${maxValue})`]);

    if (rand === 1) {
      setGameOver(true);
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col col-lg-6">
          <h1>Death Roll</h1>

          <div className="mb-3">
            {gameOver ? (
              <>
                <div className="alert alert-danger" role="alert">
                  💀 You rolled a 1, you loser
                </div>

                <button
                  className="btn btn-danger btn-lg w-100 p-4"
                  onClick={resetGame}>
                  Reset Game
                </button>
              </>
            ) : (
              <button
                className="btn btn-primary btn-lg w-100 p-4"
                onClick={rollDice}>
                Roll 1 - {maxValue}
              </button>
            )}
          </div>

          <div className="card">
            <div className="card-body">
              <h5 className="card-title mb-0">History</h5>
            </div>
            <ul className="list-group list-group-flush">
              {history.map((roll, i) =>
                <li className="list-group-item" key={i}>{roll}</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};