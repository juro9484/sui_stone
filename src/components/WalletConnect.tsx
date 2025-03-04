import React, { useState, useEffect } from 'react';
import { useCurrentWallet, useConnectWallet, useWallets } from '@mysten/dapp-kit';

const WalletConnect: React.FC = () => {
  const { isConnected, currentWallet } = useCurrentWallet();
  const wallets = useWallets();
  const { mutate: connect } = useConnectWallet();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && currentWallet && currentWallet.accounts.length > 0) {
      setWalletAddress(currentWallet.accounts[0].address);
    }
  }, [isConnected, currentWallet]);

  const handleConnect = async () => {
    try {
      const wallet = wallets[0];
      connect({wallet}, {
        onSuccess: () => console.log('connected'),
      });
    } catch (error: unknown) {
      const walletError = error as Error;
      console.error('Sui Wallet connection failed:', walletError.message || walletError);
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

export default WalletConnect;