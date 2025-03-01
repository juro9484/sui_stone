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

  const WalletConnect = () => {
    const { isConnected, currentWallet } = useCurrentWallet();
    const wallets = useWallets();
    const { mutate: connect } = useConnectWallet();

    useEffect(() => {
      const checkWallet = () => {
        console.log('Checking for Sui wallet extension...');
        if (window.suiWallet) {
          console.log('Sui wallet extension detected:', window.suiWallet);
        } else {
          console.log('No Sui wallet extension detected on window.suiWallet');
        }
      };
      checkWallet();

      if (isConnected && currentWallet && currentWallet.accounts.length > 0) {
        setWalletAddress(currentWallet.accounts[0].address);
        console.log('Auto-connected Sui Wallet:', currentWallet.accounts[0].address);
      } else {
        console.log('Wallet not auto-connected. isConnected:', isConnected, 'currentWallet:', currentWallet);
      }
    }, [isConnected, currentWallet]);

    const handleConnect = async () => {
      try {
        const wallet = wallets[0];
        connect({wallet}, {
          onSuccess: () => console.log('connected'),
        });
      } catch (error: unknown) { // Use unknown per TS rules
        const walletError = error as Error; // Cast inside block
        console.error('Sui Wallet connection failed:', walletError.message || walletError);
        alert('Failed to connect Sui Wallet. Check console for details and ensure its installed.');
      }
    };

    return walletAddress ? (
      <span className="text-sm text-blue-500 font-mono truncate max-w-[150px]">
        {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
      </span>
    ) : (
      <button
        onClick={handleConnect}
        className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
      >
        Connect Sui Wallet
      </button>
    );
  };

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
            <header className="flex justify-between items-center p-4 bg-gray-700 shadow-md border-b border-gray-600 relative z-10">
              <h1 className="text-2xl font-bold text-blue-500 drop-shadow-md">SuiStone</h1>
              <div className="flex items-center gap-4">
                <WalletConnect />
                <button
                  onClick={toggleTheme}
                  className="px-4 py-2 bg-gray-600 text-blue-500 font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-200"
                >
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </header>
            {/* <Static 
              theme={theme}
              toggleTheme={toggleTheme}
              walletAddress={walletAddress}
              currentGame={currentGame}
              leaderboard={leaderboard}
              selectGame={selectGame}
              goBackHome={goBackHome}
            /> */}
            <Experience
            />
          </div>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
};

export default App;