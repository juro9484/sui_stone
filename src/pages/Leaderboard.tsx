import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LeaderboardEntry {
  username: string;
  points: number;
  time: number;
  difficulty: string;
}

const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [game, setGame] = useState<string>('minehunter');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/game/leaderboard/${game}`)
      .then(res => setLeaderboard(res.data))
      .catch(err => console.error('Error fetching leaderboard:', err));
  }, [game]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Daily Leaderboard</h1>
      <div className="flex gap-4 mb-6">
        {['minehunter', 'wordle', 'hangman', 'trivia'].map(g => (
          <button
            key={g}
            onClick={() => setGame(g)}
            className={`px-4 py-2 rounded-md text-lg font-medium ${game === g ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            {g.charAt(0).toUpperCase() + g.slice(1)}
          </button>
        ))}
      </div>
      <table className="w-full max-w-3xl border-collapse bg-white shadow-md">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="p-2 border">Rank</th>
            <th className="p-2 border">Username</th>
            <th className="p-2 border">Points</th>
            <th className="p-2 border">Time (s)</th>
            <th className="p-2 border">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
              <td className="p-2 border text-center">{index + 1}</td>
              <td className="p-2 border">{entry.username}</td>
              <td className="p-2 border text-center">{entry.points}</td>
              <td className="p-2 border text-center">{entry.time}</td>
              <td className="p-2 border">{entry.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;