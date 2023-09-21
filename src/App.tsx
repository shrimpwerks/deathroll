import { useEffect, useState } from 'react';
import './index.css'

import LOSER_MESSAGES from './loserMessages'

const STARTING_VALUE = 100;

export default function App() {
  const [maxValue, setMaxValue] = useState(STARTING_VALUE);
  const [startingValue, setStartingValue] = useState(STARTING_VALUE)
  const [tempStartingValue, setTempStartingValue] = useState(startingValue); 
  const [history, setHistory] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [loserMessage, setLoserMessage] = useState(LOSER_MESSAGES[0]);
  // Shhhhhh
  const [blink, setBlink] = useState(false);

  function resetGame() {
    setMaxValue(startingValue);
    setHistory([]);
    setGameOver(false);
  }

  function rollDice() {
    const rand = Math.floor(Math.random() * maxValue) + 1;

    setMaxValue(rand);
    setHistory([...history, `Rolled ${rand} (out of ${maxValue})`]);

    if (rand === 1) {
      setGameOver(true);
    }
  }

  const handleStartingValueChange = () => {
    setStartingValue(tempStartingValue);
    setMaxValue(tempStartingValue);
  };

  const handleSecretBlinkClick = () => {
    setBlink(gameOver ? !blink : blink)
  }

  useEffect(() => {
    if (gameOver) {
      setLoserMessage(LOSER_MESSAGES[Math.floor(Math.random() * LOSER_MESSAGES.length)])
    }
  }, [gameOver])

  return (
    <div className="container">
      <div className="row justify-content-md-center">
        <div className="col col-lg-6 layout">
          <div className='flex justify-center'>
              <div>
                <h1 
                  onClick={handleSecretBlinkClick}
                  className={`m-5 flex gap-1 ${blink && gameOver ? 'blink' : ''}`} 
                >
                  <span className={gameOver ? 'spinning' : ''}>💀 </span>
                  Death Roll
                  <span className={gameOver ? 'spinning reverse' : ''}>💀 </span>
                </h1>
              </div>
          </div>

          <div className="mb-3">
            {gameOver ? (
              <>
                <div className="alert alert-danger loser" role="alert">
                  <span>{loserMessage}</span>
                </div>

                <button
                  className="btn btn-danger btn-lg w-100 p-4"
                  onClick={resetGame}
                >
                  Reset Game
                </button>
              </>
            ) : (
              <div className='flex flex-col gap-4'>
                {startingValue === maxValue && (
                  <div className='flex justify-center gap-1 p-1'>
                    <input
                      className="form-control starting-value"
                      type="number"
                      value={tempStartingValue}
                      onChange={e => setTempStartingValue(e.target.valueAsNumber)}
                    />
                    <button
                      onClick={handleStartingValueChange}
                      type="button"
                      className="btn btn-outline-secondary"
                    >
                      Update
                    </button>
                  </div>
                )}
                <button
                  className="btn btn-primary btn-lg w-100 p-4"
                  onClick={rollDice}>
                  {maxValue}
                </button>
              </div>
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