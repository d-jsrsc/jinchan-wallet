import bs58 from 'bs58';
import nacl from 'tweetnacl';
// import * as bip32 from 'bip32';
import { Keypair, PublicKey, Signer, Transaction } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';

import { DerivationPath } from './types';
import { getUnlockedMnemonicAndSeed } from './walletSeed';

// const bip32 = BIP32Factory(ecc);

export function getAccountFromSeed(
  seed: Buffer,
  walletIndex: number,
  dPath = DerivationPath.bip44Change
) {
  const derivedSeed = deriveSeed(seed, walletIndex, dPath);
  if (!derivedSeed) throw new Error('deriveSeed not valid');
  const kp = nacl.sign.keyPair.fromSeed(derivedSeed);
  return new Keypair(kp);
}

function deriveSeed(seed: Buffer, walletIndex: number, derivationPath: DerivationPath) {
  switch (derivationPath) {
    // case DerivationPath.deprecated: {
    //   const path = `m/501'/${walletIndex}'/0/${accountIndex}`;
    //   return bip32.fromSeed(seed).derivePath(path).privateKey;
    // }
    case DerivationPath.bip44: {
      const path44 = `m/44'/501'/${walletIndex}'`;
      return derivePath(path44, seed.toString('hex')).key;
    }
    case DerivationPath.bip44Change: {
      const path44Change = `m/44'/501'/${walletIndex}'/0'`;
      return derivePath(path44Change, seed.toString('hex')).key;
    }
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

export class LocalStorageWalletProvider {
  account: Signer;
  publicKey: PublicKey;
  listAddresses!: (
    walletCount: number
  ) => Promise<{ index: number; address: PublicKey; name: string | null }[]>;

  constructor(args: { account: Signer }) {
    this.account = args.account;
    this.publicKey = this.account.publicKey;
  }

  public async init() {
    const { seed } = await getUnlockedMnemonicAndSeed();
    if (!seed) return;
    this.listAddresses = async (walletCount: number) => {
      const seedBuffer = Buffer.from(seed, 'hex');
      return Array.from(Array(walletCount).keys()).map((walletIndex) => {
        const address = getAccountFromSeed(seedBuffer, walletIndex).publicKey;
        const name = localStorage.getItem(`name${walletIndex}`);
        return { index: walletIndex, address, name };
      });
    };
    return this;
  }

  public signTransaction(transaction: Transaction) {
    transaction.partialSign(this.account);
    return transaction;
  }

  public createSignature(message: Uint8Array) {
    return bs58.encode(nacl.sign.detached(message, this.account.secretKey));
  }
}

export type WalletProviderType = LocalStorageWalletProvider;

export class WalletProviderFactory {
  public static getProvider(
    type: string,
    args: {
      account: Signer;
    }
  ): WalletProviderType {
    if (type === 'local') {
      return new LocalStorageWalletProvider(args);
    }

    // hardware
    // if (type === 'ledger') {
    //   return new LedgerWalletProvider(args);
    // }

    throw new Error('WalletProviderFactory Error');
  }
}
