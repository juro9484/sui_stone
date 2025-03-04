import React, { useState, useEffect } from 'react';
import { SuiClientProvider, WalletProvider, useCurrentWallet, useConnectWallet, useWallets } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import Static from './Static';
import Experience from './Experience';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<{ [game: string]: any[] }>({
    hangman: [],
    wordle: [],
    trivia: [],
    minehunter: [],
    higherlower: [],
  });

  const networkConfig = {
    mainnet: { url: getFullnodeUrl('mainnet') },
    testnet: { url: getFullnodeUrl('testnet') },
  };

  const queryClient = new QueryClient();

  useEffect(() => {
    document.body.className = theme;
    fetchLeaderboard();
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const fetchLeaderboard = async () => {
    try {
      const games = ['hangman', 'wordle', 'trivia', 'minehunter', 'higherlower'];
      const leaderboardData: { [game: string]: any[] } = {};
      for (const game of games) {
        try {
          const response = await axios.get(`http://localhost:5000/api/game/leaderboard/${game}`);
          leaderboardData[game] = response.data || [];
        } catch (err: unknown) {
          const axiosError = err as AxiosError;
          console.error(`Failed to fetch leaderboard for ${game}:`, axiosError.message);
          leaderboardData[game] = [];
        }
      }
      setLeaderboard(leaderboardData);
      console.log('Leaderboard fetched:', leaderboardData);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error('fetchLeaderboard critical failure:', axiosError.message);
    }
  };

  // WalletConnect component moved to Experience.tsx

  const selectGame = (game: string) => {
    if (!walletAddress) {
      alert('Please connect your Sui Wallet first!');
      return;
    }
    setCurrentGame(game);
  };

  const goBackHome = () => {
    setCurrentGame(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
        <WalletProvider autoConnect={true}>
          <div className="min-h-screen bg-gray-800 text-gray-300 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
              <div className="bg-[radial-gradient(circle_at_50%_50%,_rgba(2,136,209,0.2)_0%,_rgba(2,136,209,0)_70%)] animate-pulse-slow w-[200%] h-[200%] absolute top-[-50%] left-[-50%]"></div>
              <div className="bg-[radial-gradient(circle_at_20%_80%,_rgba(2,136,209,0.15)_0%,_rgba(2,136,209,0)_60%)] animate-pulse-slow w-[150%] h-[150%] absolute bottom-[-25%] left-[-25%]"></div>
            </div>
            <Experience />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default App;