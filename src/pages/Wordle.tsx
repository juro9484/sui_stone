import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import wordlist from '../wordlist.json';

interface WordleProps {
  username: string;
  goBackHome: () => void;
}

const Wordle: React.FC<WordleProps> = ({ username, goBackHome }) => {
  const [word, setWord] = useState<string>('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [time, setTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const MAX_GUESSES = 5;

  const initializeGame = async () => {
    console.log('initializeGame start');
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `wordle-${today}-${username}`;
    
    localStorage.removeItem(cacheKey);
    console.log('Cache cleared for', cacheKey);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      console.log('Fetching target word from MongoDB via backend');
      const response = await axios.get(`http://localhost:5000/api/game/daily-word/wordle`, { 
        timeout: 15000,
        headers: { 'Cache-Control': 'no-cache' },
        params: { username }
      });
      console.log('initializeGame response:', response.status, response.data);
      const newWord = response.data.word;
      if (!newWord || newWord.length !== 5) throw new Error('Invalid word from backend');
      console.log('Target word fetched from backend:', newWord);
      setWord(newWord);
      localStorage.setItem(cacheKey, newWord);
      setMessage('');
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('initializeGame fetch failed:', axiosError.message, 'Code:', axiosError.code, 'Response:', axiosError.response?.data);
      if (axiosError.response?.status === 403) {
        setMessage('You’ve already played Wordle today!');
        setGameOver(true);
      } else {
        setMessage(`Failed to fetch word: ${axiosError.message} (Code: ${axiosError.code}). Backend on port 5000?`);
      }
    } finally {
      setIsLoading(false);
      if (!message) {
        setGuesses([]);
        setCurrentGuess('');
        setGameOver(false);
        setWon(false);
        setTime(0);
        setTimerActive(false);
      }
      console.log('initializeGame done, word set to:', word);
    }
  };

  useEffect(() => {
    console.log('Initial useEffect triggered');
    initializeGame().catch(err => {
      console.error('Start game failed:', (err as Error).message);
      setMessage('Failed to initialize game, please refresh.');
      setIsLoading(false);
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
        game: 'wordle',
        points,
        time: timeTaken
      });
      console.log(`Score ${points} (Time: ${timeTaken}s) saved for ${username} in Wordle`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Failed to save Wordle score:', axiosError.message);
    }
  };

  const isValidWord = (guess: string) => {
    return wordlist.includes(guess.toUpperCase());
  };

  const handleGuess = () => {
    if (gameOver || currentGuess.length !== 5 || !word) return;

    if (!isValidWord(currentGuess)) {
      setMessage('Not a valid English word!');
      return;
    }

    if (guesses.length === 0) setTimerActive(true);

    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);
    setCurrentGuess('');
    setMessage('');

    if (currentGuess === word) {
      setGameOver(true);
      setWon(true);
      setTimerActive(false);
      const points = 100 - (newGuesses.length - 1) * 20;
      setMessage(`You won! Guesses: ${newGuesses.length}, Time: ${time}s, Gems: ${points}`);
      saveScore(points, time);
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
      setWon(false);
      setTimerActive(false);
      const points = 0;
      setMessage(`Game over! The word was "${word}". Gems: ${points}, Time: ${time}s`);
      saveScore(points, time);
    }
  };

  const handleKeyPress = (letter: string) => {
    if (gameOver || currentGuess.length >= 5) return;
    setCurrentGuess(currentGuess + letter);
  };

  const handleDelete = () => {
    if (gameOver || currentGuess.length === 0) return;
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (gameOver) return;
    if (e.key === 'Backspace') {
      handleDelete();
    } else if (e.key === 'Enter' && currentGuess.length === 5) {
      handleGuess();
    } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
      setCurrentGuess(currentGuess + e.key.toUpperCase());
    }
  };

  const renderGuess = (guess: string, index: number) => {
    return (
      <div key={index} className="flex gap-2 mb-2">
        {guess.split('').map((letter, i) => {
          const isCorrect = word[i] === letter;
          const isPresent = !isCorrect && word.includes(letter);
          return (
            <span
              key={i}
              className={`w-12 h-12 flex items-center justify-center text-2xl font-bold rounded-md shadow-md animate-flip border border-gray-600 ${
                isCorrect ? 'bg-blue-500 text-gray-900' : isPresent ? 'bg-gray-500 text-blue-500' : 'bg-gray-600 text-gray-300'
              }`}
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {letter}
            </span>
          );
        })}
      </div>
    );
  };

  const renderEmptySlots = () => {
    const emptySlots = MAX_GUESSES - guesses.length - (gameOver ? 0 : 1);
    return Array.from({ length: emptySlots }, (_, i) => (
      <div key={i + guesses.length + 1} className="flex gap-2 mb-2">
        {Array(5).fill('').map((_, j) => (
          <span key={j} className="w-12 h-12 flex items-center justify-center border-2 border-gray-600 rounded-md bg-gray-700" />
        ))}
      </div>
    ));
  };

  const renderCurrentGuess = () => {
    const paddedGuess = (currentGuess + '     ').slice(0, 5);
    return (
      <div className="flex gap-2 mb-2">
        {paddedGuess.split('').map((letter, i) => (
          <span key={i} className="w-12 h-12 flex items-center justify-center text-2xl font-bold border-2 border-blue-500 rounded-md bg-gray-600 text-blue-500 shadow-md">
            {letter}
          </span>
        ))}
      </div>
    );
  };

  const renderKeyboard = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-6" onKeyDown={handleKeyDown} tabIndex={0}>
        {alphabet.map(letter => (
          <button
            key={letter}
            onClick={() => handleKeyPress(letter)}
            disabled={gameOver || guesses.length >= MAX_GUESSES}
            className={`w-10 h-10 bg-gray-600 text-lg font-medium text-blue-500 rounded-md shadow-md transition-all duration-200 border border-gray-600 ${
              gameOver || guesses.length >= MAX_GUESSES ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-500 hover:text-gray-900'
            }`}
          >
            {letter}
          </button>
        ))}
        <button
          onClick={handleDelete}
          disabled={gameOver || currentGuess.length === 0}
          className={`w-10 h-10 bg-gray-600 text-lg font-medium text-blue-500 rounded-md shadow-md transition-all duration-200 border border-gray-600 ${
            gameOver || currentGuess.length === 0 ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-500 hover:text-gray-900'
          }`}
        >
          ⌫
        </button>
        <button
          onClick={handleGuess}
          disabled={gameOver || currentGuess.length !== 5}
          className={`w-20 h-10 bg-gray-600 text-lg font-medium text-blue-500 rounded-md shadow-md transition-all duration-200 border border-gray-600 ${
            gameOver || currentGuess.length !== 5 ? 'bg-gray-500 text-gray-400 cursor-not-allowed' : 'hover:bg-blue-500 hover:text-gray-900'
          }`}
        >
          Guess
        </button>
      </div>
    );
  };

  return (
    <div className="game-container bg-gray-700 shadow-md border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-500">Wordle</h1>
        <button
          onClick={goBackHome}
          className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
        >
          Return to Vault
        </button>
      </div>
      {isLoading ? (
        <p className="text-lg text-blue-500 mb-4 animate-pulse">Polishing the Gem...</p>
      ) : (
        <>
          <div className="mb-6 bg-gray-600 p-4 rounded-md border border-gray-600">
            {guesses.map((guess, index) => renderGuess(guess, index))}
            {!gameOver && renderCurrentGuess()}
            {renderEmptySlots()}
          </div>
          {!gameOver && renderKeyboard()}
          {gameOver && (
            <div className="text-center mt-6">
              <p className={`text-xl font-semibold mb-4 ${won ? 'text-blue-500' : 'text-blue-500'}`}>{message}</p>
              <button
                onClick={() => initializeGame()}
                className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
              >
                Seek Tomorrow’s Code
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

export default Wordle;