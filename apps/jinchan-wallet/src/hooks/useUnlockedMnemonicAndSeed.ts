import { useEffect, useState } from 'react';
import {
  EMPTY_MNEMONIC,
  unlockedMnemonicAndSeed,
  walletSeedChanged
} from '../utils/wallet/walletSeed';

import { MnemonicAndSeed } from '../utils/wallet/types';

export function useUnlockedMnemonicAndSeed(): [MnemonicAndSeed, boolean] {
  const [currentUnlockedMnemonic, setCurrentUnlockedMnemonic] = useState({ ...EMPTY_MNEMONIC });

  useEffect(() => {
    walletSeedChanged.addListener('change', (data: MnemonicAndSeed) => {
      // console.log('useUnlockedMnemonicAndSeed', data);
      setCurrentUnlockedMnemonic(data);
    });
    unlockedMnemonicAndSeed.then((data) => setCurrentUnlockedMnemonic(data));
    return () => {
      walletSeedChanged.removeListener('change', setCurrentUnlockedMnemonic);
    };
  }, []);

  return [currentUnlockedMnemonic, false];
}

export function useHasLockedMnemonicAndSeed() {
  const [unlockedMnemonic, loading] = useUnlockedMnemonicAndSeed();

  return [!unlockedMnemonic.seed && !!localStorage.getItem('locked'), loading];
}
