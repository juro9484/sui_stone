import React from 'react';
import GameCard from '../components/GameCard';

const Home: React.FC = () => {
  return (
    <div className="home">
      <h1>Welcome to Gaming Hub!</h1>
      <p>Compete in fun games and win prizes!</p>
      <div className="game-grid">
        <GameCard title="WORDLE" path="/wordle" />
        <GameCard title="Hangman" path="/hangman" />
        <GameCard title="Minehunter" path="/minehunter" />
        <GameCard title="Trivia" path="/trivia" />
      </div>
    </div>
  );
};

export default Home;