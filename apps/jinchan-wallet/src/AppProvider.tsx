import { Cluster, clusterApiUrl, Connection } from '@solana/web3.js';
import React, { useContext, useEffect, useState } from 'react';
import { useMemo } from 'react';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useUnlockedMnemonicAndSeed } from './hooks/useUnlockedMnemonicAndSeed';
import { WalletSelector } from './utils/wallet/types';
import { getAccountFromSeed } from './utils/wallet/utils';
import { Wallet } from './Wallet';

export const MAINNET = 'mainnet-beta';
export const DEVNET = 'devnet';

export const DEFAULT_WALLET_SELECTOR: WalletSelector = {
  walletIndex: 0,
  importedPubkey: undefined,
  ledger: false
};

export interface AppContextData {
  network: string;
  setNetwork: (arg0: string) => void;
  connection: Connection;
  wallet: Wallet | null;
}

const AppContext = React.createContext<AppContextData | null>(null);

export function AppProvider({ children }: React.PropsWithChildren) {
  const [network, setNetwork] = useLocalStorageState('connectionNetwork', DEVNET);

  const endpoint = clusterApiUrl(network as Cluster);
  const connection = useMemo(() => new Connection(endpoint, 'recent'), [endpoint]);

  const [{ seed, importsEncryptionKey, derivationPath }] = useUnlockedMnemonicAndSeed();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [walletSelector, _setWalletSelector] = useLocalStorageState(
    'walletSelector',
    DEFAULT_WALLET_SELECTOR
  );
  useEffect(() => {
    // const storedState = localStorage.getItem('walletSelector');
    // const walletSelector = storedState ? JSON.parse(storedState) : DEFAULT_WALLET_SELECTOR;
    if (!seed || !derivationPath || !importsEncryptionKey) {
      return;
    }
    if (wallet) return;

    const account = getAccountFromSeed(
      Buffer.from(seed, 'hex'),
      walletSelector.walletIndex,
      derivationPath
    );
    Wallet.create(connection, 'local', { account }).then((wallet) => {
      setWallet(wallet);
    });
  }, [connection, seed, wallet]);

  return (
    <AppContext.Provider value={{ network, setNetwork, connection, wallet }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppConfig() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('Missing context');
  }
  return {
    network: context.network,
    setNetwork: context.setNetwork,
    connection: context.connection
  };
}

export function useWallet() {
  const walletCtx = useContext(AppContext);
  if (!walletCtx) throw new Error('!walletCtx');
  return walletCtx.wallet;
}
