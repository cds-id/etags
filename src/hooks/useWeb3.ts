'use client';

import { useState, useEffect, useCallback } from 'react';

// Base Sepolia chain configuration
export const SUPPORTED_CHAIN = {
  chainId: 84532,
  chainIdHex: '0x14a34',
  name: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  blockExplorer: 'https://sepolia.basescan.org',
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
} as const;

export interface UseWeb3Return {
  isWeb3Available: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  account: string | null;
  chainId: number | null;
  isCorrectNetwork: boolean;
  error: string | null;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  switchNetwork: () => Promise<boolean>;
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (args: {
        method: string;
        params?: unknown[];
      }) => Promise<unknown>;
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (
        event: string,
        callback: (...args: unknown[]) => void
      ) => void;
    };
  }
}

export function useWeb3(): UseWeb3Return {
  const [isWeb3Available, setIsWeb3Available] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCorrectNetwork = chainId === SUPPORTED_CHAIN.chainId;

  // Check if Web3 is available
  useEffect(() => {
    const checkWeb3 = () => {
      const available = typeof window !== 'undefined' && !!window.ethereum;
      setIsWeb3Available(available);
      return available;
    };

    checkWeb3();
  }, []);

  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: unknown) => {
    const accountList = accounts as string[];
    if (accountList.length === 0) {
      setAccount(null);
      setIsConnected(false);
    } else {
      setAccount(accountList[0]);
      setIsConnected(true);
    }
  }, []);

  // Handle chain changes
  const handleChainChanged = useCallback((chainIdHex: unknown) => {
    const newChainId = parseInt(chainIdHex as string, 16);
    setChainId(newChainId);
  }, []);

  // Setup event listeners
  useEffect(() => {
    if (!isWeb3Available || !window.ethereum) return;

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Check if already connected
    window.ethereum
      .request({ method: 'eth_accounts' })
      .then((accounts) => {
        handleAccountsChanged(accounts);
      })
      .catch(console.error);

    // Get current chain
    window.ethereum
      .request({ method: 'eth_chainId' })
      .then((chainIdHex) => {
        handleChainChanged(chainIdHex);
      })
      .catch(console.error);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          'accountsChanged',
          handleAccountsChanged
        );
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [isWeb3Available, handleAccountsChanged, handleChainChanged]);

  // Connect wallet
  const connect = useCallback(async (): Promise<string | null> => {
    if (!isWeb3Available || !window.ethereum) {
      setError('Web3 wallet not detected. Please install MetaMask.');
      return null;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        // Get chain ID
        const chainIdHex = (await window.ethereum.request({
          method: 'eth_chainId',
        })) as string;
        setChainId(parseInt(chainIdHex, 16));

        return accounts[0];
      }

      return null;
    } catch (err) {
      const error = err as { code?: number; message?: string };
      if (error.code === 4001) {
        setError('Connection rejected by user');
      } else {
        setError(error.message || 'Failed to connect wallet');
      }
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [isWeb3Available]);

  // Disconnect (just clear state, can't actually disconnect from MetaMask)
  const disconnect = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    setError(null);
  }, []);

  // Switch to correct network
  const switchNetwork = useCallback(async (): Promise<boolean> => {
    if (!isWeb3Available || !window.ethereum) {
      setError('Web3 wallet not detected');
      return false;
    }

    setError(null);

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SUPPORTED_CHAIN.chainIdHex }],
      });
      return true;
    } catch (switchError) {
      const error = switchError as { code?: number };

      // Chain not added, try to add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SUPPORTED_CHAIN.chainIdHex,
                chainName: SUPPORTED_CHAIN.name,
                nativeCurrency: SUPPORTED_CHAIN.nativeCurrency,
                rpcUrls: [SUPPORTED_CHAIN.rpcUrl],
                blockExplorerUrls: [SUPPORTED_CHAIN.blockExplorer],
              },
            ],
          });
          return true;
        } catch (addError) {
          const err = addError as { message?: string };
          setError(err.message || 'Failed to add network');
          return false;
        }
      }

      const err = switchError as { message?: string };
      setError(err.message || 'Failed to switch network');
      return false;
    }
  }, [isWeb3Available]);

  return {
    isWeb3Available,
    isConnected,
    isConnecting,
    account,
    chainId,
    isCorrectNetwork,
    error,
    connect,
    disconnect,
    switchNetwork,
  };
}

/**
 * Get explorer URL for a transaction
 */
export function getTxUrl(txHash: string): string {
  return `${SUPPORTED_CHAIN.blockExplorer}/tx/${txHash}`;
}

/**
 * Get explorer URL for an address
 */
export function getAddressUrl(address: string): string {
  return `${SUPPORTED_CHAIN.blockExplorer}/address/${address}`;
}

/**
 * Get explorer URL for an NFT token
 */
export function getNFTUrl(contractAddress: string, tokenId: string): string {
  return `${SUPPORTED_CHAIN.blockExplorer}/nft/${contractAddress}/${tokenId}`;
}

/**
 * Format wallet address for display
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
