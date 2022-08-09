import { DEFAULT_WALLET_SELECTOR, useWallet } from '../AppProvider';
import { useLocalStorageState } from '../hooks/useLocalStorageState';
import { DerivationPath } from '../utils/wallet/types';
import { mnemonicToSeed, storeMnemonicAndSeed } from '../utils/wallet/walletSeed';

export default function App() {
  const wallet = useWallet();

  const [_walletSelector, setWalletSelector] = useLocalStorageState(
    'walletSelector',
    DEFAULT_WALLET_SELECTOR
  );

  async function restoreWallet(mnemonic: string) {
    try {
      const seed = await mnemonicToSeed(mnemonic);
      setWalletSelector(DEFAULT_WALLET_SELECTOR);
      await storeMnemonicAndSeed(mnemonic, seed, '', DerivationPath.bip44Change);
    } catch (error) {
      alert((error as Error).message);
    }
  }

  const testMnemonic = process.env.REACT_APP_MY_MNEMONIC;

  if (!testMnemonic) return null;
  if (!wallet) {
    return (
      <div>
        <button
          onClick={() => {
            restoreWallet(testMnemonic);
          }}>
          restore
        </button>
      </div>
    );
  }
  return <div>WalletApp</div>;
}
