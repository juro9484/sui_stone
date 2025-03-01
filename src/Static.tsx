import React from 'react';
import Hangman from './pages/Hangman';
import Wordle from './pages/Wordle';
import Trivia from './pages/Trivia';
import Minehunter from './pages/Minehunter';
import HigherLower from './pages/HigherLower';

interface GameProps {
  username: string;
  goBackHome: () => void;
}

interface StaticProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  walletAddress: string | null;
  currentGame: string | null;
  leaderboard: { [game: string]: any[] };
  selectGame: (game: string) => void;
  goBackHome: () => void;
}

const Static: React.FC<StaticProps> = ({
  theme,
  toggleTheme,
  walletAddress,
  currentGame,
  leaderboard,
  selectGame,
  goBackHome
}) => {
  const renderGame = () => {
    if (!walletAddress || !currentGame) return null;
    const gameComponents: { [key: string]: React.ComponentType<GameProps> } = {
      hangman: Hangman,
      wordle: Wordle,
      trivia: Trivia,
      minehunter: Minehunter,
      higherlower: HigherLower,
    };
    const GameComponent = gameComponents[currentGame];
    return <GameComponent username={walletAddress} goBackHome={goBackHome} />;
  };

  const renderLeaderboard = () => {
    return (
      <div className="mt-8 w-full max-w-5xl">
        <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center drop-shadow-md">SuiStone Legends</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {['hangman', 'wordle', 'trivia', 'minehunter', 'higherlower'].map(game => (
            <div key={game} className="bg-gray-700 p-4 rounded-lg shadow-md border border-gray-600 overflow-hidden">
              <h3 className="text-xl font-semibold text-blue-500 capitalize mb-4 text-center truncate">
                {game === 'higherlower' ? 'Higher/Lower' : game}
              </h3>
              <table className="w-full text-sm text-gray-300 table-fixed">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="py-2 text-left w-1/6">Rank</th>
                    <th className="py-2 text-left w-3/6">Miner</th>
                    <th className="py-2 text-right w-1/6">Gems</th>
                    <th className="py-2 text-right w-1/6">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard[game] && leaderboard[game].length > 0 ? (
                    leaderboard[game].map((entry, index) => (
                      <tr key={index} className="border-b border-gray-600 hover:bg-gray-600 transition-all duration-200">
                        <td className="py-2 truncate">{index + 1}</td>
                        <td className="py-2 truncate" title={entry.username}>
                          {entry.username.slice(0, 6)}...{entry.username.slice(-4)}
                        </td>
                        <td className="py-2 text-right truncate">{entry.points}</td>
                        <td className="py-2 text-right truncate">{entry.time}s</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-2 text-center truncate">No miners yet</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main className="flex flex-col items-center py-8 relative z-10">
      {!currentGame ? (
        <div className="game-container bg-gray-700 shadow-md border border-gray-600">
          <h2 className="text-3xl font-bold text-blue-500 mb-6 text-center drop-shadow-md">Choose Your Quest</h2>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
            <button
              onClick={() => selectGame('hangman')}
              className="p-6 bg-gray-600 rounded-lg shadow-md hover:bg-gray-500 hover:text-blue-500 transition-all duration-200 border border-gray-600"
            >
              <h3 className="text-xl font-semibold text-blue-500">Hangman</h3>
              <p className="text-gray-400">Unravel the Riddle</p>
            </button>
            <button
              onClick={() => selectGame('wordle')}
              className="p-6 bg-gray-600 rounded-lg shadow-md hover:bg-gray-500 hover:text-blue-500 transition-all duration-200 border border-gray-600"
            >
              <h3 className="text-xl font-semibold text-blue-500">Wordle</h3>
              <p className="text-gray-400">Crack the Code</p>
            </button>
            <button
              onClick={() => selectGame('trivia')}
              className="p-6 bg-gray-600 rounded-lg shadow-md hover:bg-gray-500 hover:text-blue-500 transition-all duration-200 border border-gray-600"
            >
              <h3 className="text-xl font-semibold text-blue-500">Trivia</h3>
              <p className="text-gray-400">Master the Lore</p>
            </button>
            <button
              onClick={() => selectGame('minehunter')}
              className="p-6 bg-gray-600 rounded-lg shadow-md hover:bg-gray-500 hover:text-blue-500 transition-all duration-200 border border-gray-600"
            >
              <h3 className="text-xl font-semibold text-blue-500">Minehunter</h3>
              <p className="text-gray-400">Seek the Veins</p>
            </button>
            <button
              onClick={() => selectGame('higherlower')}
              className="p-6 bg-gray-600 rounded-lg shadow-md hover:bg-gray-500 hover:text-blue-500 transition-all duration-200 border border-gray-600"
            >
              <h3 className="text-xl font-semibold text-blue-500">Higher/Lower</h3>
              <p className="text-gray-400">Risk the Abyss</p>
            </button>
          </div>
        </div>
      ) : (
        renderGame()
      )}
      {!currentGame && renderLeaderboard()}
    </main>
  );
};

export default Static;