import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface MinehunterProps {
  username: string;
  goBackHome: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface Cell {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

const Minehunter: React.FC<MinehunterProps> = ({ username, goBackHome }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [time, setTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const config = {
    easy: { size: 10, mines: 10 },
    medium: { size: 15, mines: 40 },
    hard: { size: 25, mines: 99 },
  };

  const initializeGame = async () => {
    console.log('initializeGame start');
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `minehunter-${today}-${username}`;
    
    localStorage.removeItem(cacheKey);
    console.log('Cache cleared for', cacheKey);

    try {
      console.log('Fetching Minehunter state from backend');
      const response = await axios.get(`http://localhost:5000/api/game/daily-word/minehunter`, { 
        timeout: 10000,
        headers: { 'Cache-Control': 'no-cache' },
        params: { username }
      });
      console.log('initializeGame response:', response.data);
      setMessage('');
      resetGame();
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('initializeGame fetch failed:', axiosError.message, 'Response:', axiosError.response?.data);
      if (axiosError.response?.status === 403) {
        setMessage('You’ve already mined today!');
        setGameOver(true);
      } else {
        console.log('Backend failed, proceeding with local game initialization');
        setMessage('');
        resetGame();
      }
    } finally {
      setIsLoading(false);
      console.log('initializeGame done');
    }
  };

  const resetGame = () => {
    const { size, mines } = config[difficulty];
    const newGrid = Array(size).fill(null).map(() =>
      Array(size).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!newGrid[row][col].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const r = row + dr;
              const c = col + dc;
              if (r >= 0 && r < size && c >= 0 && c < size && newGrid[r][c].isMine) {
                count++;
              }
            }
          }
          newGrid[row][col].neighborMines = count;
        }
      }
    }

    setGrid(newGrid);
    setGameOver(false);
    setWon(false);
    setTime(0);
    setTimerActive(false);
  };

  useEffect(() => {
    console.log('Initial useEffect triggered');
    initializeGame().catch(err => {
      console.error('Start game failed:', (err as Error).message);
      setMessage('Failed to initialize game, proceeding locally.');
      setIsLoading(false);
      resetGame();
    });
  }, [username]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive && !gameOver) {
      interval = setInterval(() => setTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameOver]);

  const saveScore = async (points: number, timeTaken: number) => {
    try {
      await axios.post('http://localhost:5000/api/game/score', {
        username,
        game: 'minehunter',
        points,
        time: timeTaken
      });
      console.log(`Score ${points} (Time: ${timeTaken}s) saved for ${username} in Minehunter`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Failed to save Minehunter score:', axiosError.message);
    }
  };

  const revealCell = (row: number, col: number) => {
    if (gameOver || isLoading || grid[row][col].isRevealed || grid[row][col].isFlagged) return;

    if (!timerActive) setTimerActive(true);

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isRevealed = true;

    if (newGrid[row][col].isMine) {
      setGameOver(true);
      setWon(false);
      setTimerActive(false);
      const points = difficulty === 'easy' ? 0 : difficulty === 'medium' ? 50 : 75;
      setMessage(`Boom! Ruby lost. Gems: ${points}, Time: ${time}s`);
      saveScore(points, time);
      setGrid(newGrid);
      return;
    }

    if (newGrid[row][col].neighborMines === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const r = row + dr;
          const c = col + dc;
          if (r >= 0 && r < config[difficulty].size && c >= 0 && c < config[difficulty].size) {
            revealCell(r, c);
          }
        }
      }
    }

    setGrid(newGrid);
    checkWin();
  };

  const toggleFlag = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameOver || isLoading || grid[row][col].isRevealed) return;

    if (!timerActive) setTimerActive(true);

    const newGrid = [...grid.map(row => [...row])];
    newGrid[row][col].isFlagged = !newGrid[row][col].isFlagged;
    setGrid(newGrid);
  };

  const checkWin = () => {
    const { size } = config[difficulty];
    let unrevealedNonMines = 0;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (!grid[row][col].isMine && !grid[row][col].isRevealed) {
          unrevealedNonMines++;
        }
      }
    }
    if (unrevealedNonMines === 0) {
      setGameOver(true);
      setWon(true);
      setTimerActive(false);
      const points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300;
      setMessage(`Victory! Rubies secured. Gems: ${points}, Time: ${time}s`);
      saveScore(points, time);
    }
  };

  const renderGrid = () => {
    return grid.map((row, rowIndex) => (
      <div key={rowIndex} className="flex">
        {row.map((cell, colIndex) => (
          <div
            key={colIndex}
            onClick={() => revealCell(rowIndex, colIndex)}
            onContextMenu={(e) => toggleFlag(rowIndex, colIndex, e)}
            className={`w-8 h-8 flex items-center justify-center text-sm font-medium border border-gray-600 cursor-pointer transition-all duration-200 rounded-sm shadow-md ${
              cell.isRevealed
                ? cell.isMine
                  ? 'bg-blue-500 text-gray-300'
                  : 'bg-gray-600 text-blue-500'
                : cell.isFlagged
                ? 'bg-gray-500 text-blue-500'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {cell.isRevealed
              ? cell.isMine
                ? '💣'
                : cell.neighborMines > 0
                ? cell.neighborMines
                : ''
              : cell.isFlagged
              ? '🚩'
              : ''}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <div className="game-container bg-gray-700 shadow-md border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-500">Minehunter</h1>
        <button
          onClick={goBackHome}
          className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
        >
          Return to Vault
        </button>
      </div>
      {isLoading ? (
        <p className="text-lg text-blue-500 mb-4 animate-pulse">Excavating the Veins...</p>
      ) : (
        <>
          {!gameOver && (
            <div className="mb-4 flex justify-center gap-4">
              <button
                onClick={() => { setDifficulty('easy'); resetGame(); }}
                className={`px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                  difficulty === 'easy' ? 'bg-blue-500 text-gray-900' : 'hover:bg-gray-500'
                }`}
              >
                Easy
              </button>
              <button
                onClick={() => { setDifficulty('medium'); resetGame(); }}
                className={`px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                  difficulty === 'medium' ? 'bg-blue-500 text-gray-900' : 'hover:bg-gray-500'
                }`}
              >
                Medium
              </button>
              <button
                onClick={() => { setDifficulty('hard'); resetGame(); }}
                className={`px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                  difficulty === 'hard' ? 'bg-blue-500 text-gray-900' : 'hover:bg-gray-500'
                }`}
              >
                Hard
              </button>
            </div>
          )}
          <div className="mb-4 text-center text-blue-500">Time: {time}s</div>
          <div className="inline-block">{renderGrid()}</div>
          {gameOver && (
            <div className="text-center mt-6">
              <p className={`text-xl font-semibold mb-4 ${won ? 'text-blue-500' : 'text-blue-500'}`}>{message}</p>
              <button
                onClick={() => initializeGame()}
                className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
              >
                Mine Tomorrow’s Veins
              </button>
            </div>
          )}
          {message && !gameOver && (
            <p className="text-lg text-blue-500 text-center">{message}</p>
          )}
        </>
      )}
    </div>
  );
};

export default Minehunter;