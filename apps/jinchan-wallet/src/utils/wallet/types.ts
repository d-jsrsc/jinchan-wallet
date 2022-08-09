import { PublicKey } from '@solana/web3.js';

export enum DerivationPath {
  deprecated = 'undefined',
  bip44 = 'bip44',
  bip44Change = 'bip44Change',
  bip44Root = 'bip44Root' // Ledger only.
}

export type MnemonicAndSeed =
  | {
      mnemonic: string;
      seed: string;
      importsEncryptionKey: Buffer;
      derivationPath?: DerivationPath;
    }
  | {
      mnemonic: null;
      seed: null;
      importsEncryptionKey: undefined;
      derivationPath?: DerivationPath.deprecated;
    };

export type WalletSelector = {
  walletIndex: number;
  ledger: boolean;
  importedPubkey?: string | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  account?: any; // 硬件钱包?
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  change?: any; // 硬件钱包?
  derivationPath?: string; // 硬件钱包?
};
export type Accounts = {
  selector: WalletSelector;
  isSelected: boolean;
  address: PublicKey;
  name: string;
}[];
