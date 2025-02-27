import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface HigherLowerProps {
  username: string;
  goBackHome: () => void;
}

const HigherLower: React.FC<HigherLowerProps> = ({ username, goBackHome }) => {
  const [currentNumber, setCurrentNumber] = useState<number>(0);
  const [score, setScore] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [runScores, setRunScores] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const initializeGame = async () => {
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `higherlower-${today}-${username}`;
    
    localStorage.removeItem(cacheKey);

    try {
      const response = await axios.get(`http://localhost:3000/api/game/daily-word/higherlower`, { 
        timeout: 10000,
        headers: { 'Cache-Control': 'no-cache' },
        params: { username }
      });
      console.log('initializeGame response:', response.data);
      setMessage('');
      setCurrentNumber(Math.floor(Math.random() * 15) + 1);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('initializeGame fetch failed:', axiosError.message, 'Response:', axiosError.response?.data);
      if (axiosError.response?.status === 403) {
        setMessage('You’ve already played today! Next round: Tuesday or Saturday.');
        setGameOver(true);
      } else {
        setMessage('');
        setCurrentNumber(Math.floor(Math.random() * 15) + 1);
      }
    } finally {
      setIsLoading(false);
      setScore(1);
      setLives(3);
      setTotalScore(0);
      setRunScores([]);
      setGameOver(false);
    }
  };

  useEffect(() => {
    initializeGame().catch((err: unknown) => {
      const axiosError = err as AxiosError;
      console.error('Start game failed:', axiosError.message);
      setMessage('Failed to initialize game, proceeding locally.');
      setIsLoading(false);
      setCurrentNumber(Math.floor(Math.random() * 15) + 1);
    });
  }, [username]);

  const makeGuess = async (guess: 'higher' | 'lower') => {
    if (gameOver || lives <= 0) return;
    try {
      const response = await axios.post('http://localhost:3000/api/game/higherlower/next', {
        username,
        currentNumber,
        guess
      });
      console.log('Guess response:', response.data);
      const { nextNumber, correct } = response.data;
      setCurrentNumber(nextNumber);
      if (correct) {
        setScore(score * 2);
        setMessage('');
      } else {
        setRunScores([...runScores, 0]);
        setLives(lives - 1);
        setTotalScore(totalScore + 0);
        setScore(1);
        setCurrentNumber(Math.floor(Math.random() * 15) + 1);
        if (lives - 1 === 0) {
          setGameOver(true);
          saveScore(totalScore);
          setMessage(`All lives lost! Final Score: ${totalScore + 0} Gems. Check payout details manually!`);
        } else {
          setMessage(`Crashed! Next number was ${nextNumber}. Lives left: ${lives - 1}`);
        }
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Guess failed:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status
      });
      setMessage(`Failed to process guess: ${axiosError.message}. Try again or check server.`);
    }
  };

  const cashOut = async () => {
    if (gameOver || lives <= 0) return;
    setRunScores([...runScores, score]);
    setTotalScore(totalScore + score);
    setLives(lives - 1);
    setScore(1);
    setCurrentNumber(Math.floor(Math.random() * 15) + 1);
    if (lives - 1 === 0) {
      setGameOver(true);
      saveScore(totalScore + score);
      setMessage(`Cashed out! Final Score: ${totalScore + score} Gems locked in. Check payout details manually!`);
    } else {
      setMessage(`Cashed out! Run Score: ${score}, Lives left: ${lives - 1}`);
    }
  };

  const saveScore = async (finalScore: number) => {
    try {
      await axios.post('http://localhost:3000/api/game/score', {
        username,
        game: 'higherlower',
        points: finalScore,
        time: 0
      });
      console.log(`Final Score ${finalScore} saved for ${username}`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Save score failed:', axiosError.message);
      setMessage('Failed to save score, try again.');
    }
  };

  return (
    <div className="game-container bg-gray-700 shadow-md border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-500">Higher/Lower</h1>
        <button
          onClick={goBackHome}
          className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
        >
          Return to Vault
        </button>
      </div>
      {isLoading ? (
        <p className="text-lg text-blue-500 mb-4 animate-pulse">Descending the Abyss...</p>
      ) : (
        <>
          <div className="mb-6 text-center">
            <div className="text-6xl font-bold text-blue-500 mb-4">{currentNumber}</div>
            {!gameOver && lives > 0 && (
              <div className="flex gap-4 justify-center mb-6">
                <button
                  onClick={() => makeGuess('higher')}
                  className="px-6 py-3 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-blue-500 hover:text-gray-900 transition-all duration-200 border border-gray-600"
                >
                  Higher
                </button>
                <button
                  onClick={() => makeGuess('lower')}
                  className="px-6 py-3 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-blue-500 hover:text-gray-900 transition-all duration-200 border border-gray-600"
                >
                  Lower
                </button>
                <button
                  onClick={cashOut}
                  className="px-6 py-3 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-blue-500 hover:text-gray-900 transition-all duration-200 border border-gray-600"
                >
                  Cash Out
                </button>
              </div>
            )}
            <div className="text-blue-500">
              <p>Run Score: {score} Gems</p>
              <p>Total Score: {totalScore} Gems</p>
              <p>Lives: {lives}</p>
            </div>
          </div>
          {message && (
            <p className="text-lg text-blue-500 text-center mb-4">{message}</p>
          )}
          {gameOver && (
            <div className="text-center mt-6">
              <button
                onClick={() => initializeGame()}
                className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
              >
                Next Round: Tue/Sat
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HigherLower;