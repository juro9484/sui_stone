import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header>
      <nav>
        <h1>Gaming Hub</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/wordle">WORDLE</Link></li>
          <li><Link to="/hangman">Hangman</Link></li>
          <li><Link to="/minehunter">Minehunter</Link></li>
          <li><Link to="/trivia">Trivia</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li> {/* Add this */}
        </ul>
      </nav>
    </header>
  );
}

export default Header;