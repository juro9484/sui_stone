import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface TriviaProps {
  username: string;
  goBackHome: () => void;
}

const Trivia: React.FC<TriviaProps> = ({ username, goBackHome }) => {
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const initializeGame = async () => {
    console.log('initializeGame start');
    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `trivia-${today}-${username}`;
    
    localStorage.removeItem(cacheKey);
    console.log('Cache cleared for', cacheKey);

    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      console.log('Fetching trivia questions from MongoDB via backend');
      const response = await axios.get(`http://localhost:5000/api/game/daily-word/trivia`, { 
        timeout: 15000,
        headers: { 'Cache-Control': 'no-cache' },
        params: { username }
      });
      console.log('initializeGame response:', response.status, response.data);
      const newQuestions = response.data.questions;
      if (!Array.isArray(newQuestions) || newQuestions.length !== 10) throw new Error('Invalid questions from backend');
      console.log('Trivia questions fetched from backend:', newQuestions);
      setQuestions(newQuestions);
      localStorage.setItem(cacheKey, JSON.stringify(newQuestions));
      setMessage('');
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('initializeGame fetch failed:', axiosError.message, 'Code:', axiosError.code, 'Response:', axiosError.response?.data);
      if (axiosError.response?.status === 403) {
        setMessage('You’ve already played Trivia today!');
        setGameOver(true);
      } else {
        setMessage(`Failed to fetch questions: ${axiosError.message} (Code: ${axiosError.code}). Backend on port 5000?`);
      }
    } finally {
      setIsLoading(false);
      if (!message) {
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setScore(0);
        setGameOver(false);
      }
      console.log('initializeGame done, questions set to:', questions.length);
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

  const saveScore = async (finalScore: number) => {
    try {
      await axios.post('http://localhost:5000/api/game/score', {
        username,
        game: 'trivia',
        points: finalScore * 10,
        time: 0
      });
      console.log(`Score ${finalScore * 10} saved for ${username} in Trivia`);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      console.error('Failed to save Trivia score:', axiosError.message);
    }
  };

  const handleAnswer = (answer: string) => {
    if (gameOver || selectedAnswer) return;

    setSelectedAnswer(answer);
    const isCorrect = answer === questions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
      setMessage('Correct!');
    } else {
      setMessage(`Wrong! Correct answer was "${questions[currentQuestionIndex].correctAnswer}".`);
    }

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setMessage('');
      } else {
        setGameOver(true);
        const finalScore = score + (isCorrect ? 1 : 0);
        setMessage(`Quest Complete! Your haul: ${finalScore}/10 Gems`);
        saveScore(finalScore);
      }
    }, 1500);
  };

  const renderQuestion = () => {
    if (!questions.length) return null;
    const { question, options, correctAnswer } = questions[currentQuestionIndex];
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-6 text-blue-500">{question}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              disabled={selectedAnswer !== null}
              className={`p-4 rounded-md text-lg font-medium shadow-md transition-all duration-200 border border-gray-600 ${
                selectedAnswer
                  ? option === correctAnswer
                    ? 'bg-blue-500 text-gray-900'
                    : option === selectedAnswer
                    ? 'bg-blue-500 text-gray-300'
                    : 'bg-gray-600 text-gray-300'
                  : 'bg-gray-600 text-blue-500 hover:bg-blue-500 hover:text-gray-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {message && !gameOver && (
          <p className={`mt-6 text-xl font-semibold ${selectedAnswer === correctAnswer ? 'text-blue-500' : 'text-blue-500'}`}>
            {message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="game-container bg-gray-700 shadow-md border border-gray-600">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-blue-500">Trivia</h1>
        <button
          onClick={goBackHome}
          className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
        >
          Return to Vault
        </button>
      </div>
      {isLoading ? (
        <p className="text-lg text-blue-500 mb-4 animate-pulse">Unveiling the Lore...</p>
      ) : (
        <>
          <div className="mb-6 bg-gray-600 p-6 rounded-md border border-gray-600">
            <p className="text-lg mb-4 text-blue-500">Quest {currentQuestionIndex + 1} of 10 | Gems: {score}</p>
            {!gameOver && renderQuestion()}
          </div>
          {gameOver && (
            <div className="text-center mt-6">
              <p className="text-xl font-semibold text-blue-500 mb-4">{message}</p>
              <button
                onClick={() => initializeGame()}
                className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
              >
                Seek Tomorrow’s Lore
              </button>
            </div>
          )}
          {message && !gameOver && currentQuestionIndex === 0 && (
            <p className="text-lg text-blue-500 text-center">{message}</p>
          )}
        </>
      )}
    </div>
  );
};

export default Trivia;