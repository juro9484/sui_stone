interface Window {
    suiWallet?: {
      connect: () => Promise<void>;
      getAccounts: () => Promise<string[]>;
      connected?: boolean;
      [key: string]: any; // Fallback
    };
  }
  
  declare global {
    interface Window {
      suiWallet?: {
        connect: () => Promise<void>;
        getAccounts: () => Promise<string[]>;
        connected?: boolean;
        [key: string]: any;
      };
    }
  }