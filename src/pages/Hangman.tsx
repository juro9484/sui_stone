import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface HangmanProps {
  username: string;
  goBackHome: () => void;
}

const Hangman: React.FC<HangmanProps> = ({ username, goBackHome }) => {
  const [word, setWord] = useState<string>('');
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [won, setWon] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const MAX_WRONG_GUESSES = 5;

  const initializeGame = async () => {
    console.log('initializeGame start');
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `hangman-${today}-${username}`;
    
    localStorage.removeItem(cacheKey);
    console.log('Cache cleared for', cacheKey);

    try {
      console.log('Fetching target word from MongoDB via backend');
      const response = await axios.get(`http://localhost:5000/api/game/daily-word/hangman`, { 
        timeout: 10000,
        headers: { 'Cache-Control': 'no-cache' },
        params: { username }
      });
      console.log('initializeGame response:', response.data);
      const newWord = response.data.word;
      console.log('Target word fetched from backend:', newWord);
      setWord(newWord);
      localStorage.setItem(cacheKey, newWord);
      setMessage('');
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('initializeGame fetch failed:', axiosError.message, 'Response:', axiosError.response?.data);
      if (axiosError.response?.status === 403) {
        setMessage('You’ve already played Hangman today!');
        setGameOver(true);
      } else {
        setMessage('Failed to fetch word from MongoDB, check backend!');
      }
    } finally {
      setIsLoading(false);
      if (!message) {
        setGuessedLetters(new Set());
        setGameOver(false);
        setWon(false);
        setGameStarted(false);
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
        game: 'hangman',
        points,
        time: timeTaken
      });
      console.log(`Score ${points} (Time: ${timeTaken}s) saved for ${username} in Hangman`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Failed to save Hangman score:', axiosError.message);
    }
  };

  const guessLetter = (letter: string) => {
    if (gameOver || guessedLetters.has(letter) || !word || isLoading) {
      console.log('Guess blocked:', { gameOver, hasLetter: guessedLetters.has(letter), word, isLoading });
      return;
    }

    if (!gameStarted) {
      setGameStarted(true);
      setTimerActive(true);
    }

    const newGuessedLetters = new Set(guessedLetters);
    newGuessedLetters.add(letter);
    setGuessedLetters(newGuessedLetters);

    const wrongGuesses = Array.from(newGuessedLetters).filter(l => !word.includes(l)).length;
    const wordRevealed = word.split('').every(char => char === ' ' || newGuessedLetters.has(char));

    console.log('Hangman guess:', letter, 'Wrong:', wrongGuesses, 'Revealed:', wordRevealed);

    if (wrongGuesses >= MAX_WRONG_GUESSES) {
      setGameOver(true);
      setWon(false);
      setTimerActive(false);
      const points = 0;
      setMessage(`Game over! The word was "${word}". Gems: ${points}, Time: ${time}s`);
      saveScore(points, time);
    } else if (wordRevealed) {
      setGameOver(true);
      setWon(true);
      setTimerActive(false);
      const points = 100 - wrongGuesses * 20;
      setMessage(`You won! Wrong guesses: ${wrongGuesses}, Time: ${time}s, Gems: ${points}`);
      saveScore(points, time);
    }
  };

  const renderWord = () => {
    if (isLoading || !word) return <span className="text-2xl font-mono mx-2 text-blue-500 animate-pulse">Unveiling...</span>;
    return word.split('').map((char, index) => (
      <span key={index} className="text-2xl font-mono mx-2 w-8 h-10 flex items-center justify-center border-b-2 border-blue-500 text-blue-500">
        {char === ' ' ? '\u00A0' : (guessedLetters.has(char) ? char : '_')}
      </span>
    ));
  };

  const renderHangman = () => {
    const wrongGuesses = Array.from(guessedLetters).filter(l => word && !word.includes(l)).length;
    return (
      <svg className="w-64 h-64 mb-6 text-blue-500" viewBox="0 0 200 200">
        <line x1="20" y1="180" x2="180" y2="180" stroke="currentColor" strokeWidth="6" />
        <line x1="100" y1="180" x2="100" y2="20" stroke="currentColor" strokeWidth="6" />
        <line x1="100" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="6" />
        <line x1="140" y1="20" x2="140" y2="40" stroke="currentColor" strokeWidth="6" />
        {wrongGuesses > 0 && <circle cx="140" cy="60" r="20" fill="none" stroke="currentColor" strokeWidth="4" />}
        {wrongGuesses > 1 && <line x1="140" y1="80" x2="140" y2="130" stroke="currentColor" strokeWidth="4" />}
        {wrongGuesses > 2 && <line x1="140" y1="90" x2="110" y2="70" stroke="currentColor" strokeWidth="4" />}
        {wrongGuesses > 3 && <line x1="140" y1="90" x2="170" y2="70" stroke="currentColor" strokeWidth="4" />}
        {wrongGuesses > 4 && <line x1="140" y1="130" x2="110" y2="160" stroke="currentColor" strokeWidth="4" />}
        {gameOver && !won && <rect x="130" y="60" width="20" height="40" fill="#0288D1" />}
      </svg>
    );
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="game-container bg-gray-700 shadow-md border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-500">Hangman</h1>
        <button
          onClick={goBackHome}
          className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
        >
          Return to Vault
        </button>
      </div>
      {isLoading ? (
        <p className="text-lg text-blue-500 mb-4 animate-pulse">Carving the Riddle...</p>
      ) : (
        <>
          {renderHangman()}
          <div className="mb-6 flex flex-wrap justify-center gap-2 bg-gray-600 p-4 rounded-md border border-gray-600">{renderWord()}</div>
          {!gameOver && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {alphabet.map(letter => (
                <button
                  key={letter}
                  onClick={() => guessLetter(letter)}
                  disabled={guessedLetters.has(letter) || gameOver || isLoading}
                  className={`w-12 h-12 bg-gray-600 text-lg font-medium text-blue-500 rounded-md shadow-md transition-all duration-200 border border-gray-600 ${
                    guessedLetters.has(letter) || isLoading
                      ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                      : 'hover:bg-blue-500 hover:text-gray-900'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
          {gameOver && (
            <div className="text-center">
              <p className={`text-xl font-semibold mb-4 ${won ? 'text-blue-500' : 'text-blue-500'}`}>{message}</p>
              <button
                onClick={() => initializeGame()}
                className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
              >
                Seek Tomorrow’s Riddle
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

export default Hangman;