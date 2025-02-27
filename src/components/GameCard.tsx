import React from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  title: string;
  path: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, path }) => {
  return (
    <div className="game-card">
      <h2>{title}</h2>
      <Link to={path}>Play Now</Link>
    </div>
  );
};

export default GameCard;