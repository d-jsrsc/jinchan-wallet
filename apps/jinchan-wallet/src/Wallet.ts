import nacl from 'tweetnacl';
import { Connection, PublicKey, Signer, Transaction } from '@solana/web3.js';
import { getUnlockedMnemonicAndSeed } from './utils/wallet/walletSeed';
import bs58 from 'bs58';
import {
  getAccountFromSeed,
  WalletProviderFactory,
  WalletProviderType
} from './utils/wallet/utils';

export class Wallet {
  connection: Connection;
  type: string;
  provider: WalletProviderType;

  constructor(
    connection: Connection,
    type: string,
    args: {
      account: Signer;
      publicKey?: PublicKey;
    }
  ) {
    this.connection = connection;
    this.type = type;
    this.provider = WalletProviderFactory.getProvider(type, args);
  }

  static async create(
    connection: Connection,
    type: string,
    args: {
      account: Signer;
    }
  ) {
    const instance = new Wallet(connection, type, args);
    await instance.provider.init();
    return instance;
  }

  get publicKey() {
    return this.provider.publicKey;
  }

  get allowsExport() {
    return this.type === 'local';
  }

  //   async getTokenAccountInfo() {
  //     const accounts = await getOwnedTokenAccounts(this.connection, this.publicKey);
  //     return accounts
  //       .map(({ publicKey, accountInfo }) => {
  //         setInitialAccountInfo(this.connection, publicKey, accountInfo);
  //         return { publicKey, parsed: parseTokenAccountData(accountInfo.data) };
  //       })
  //       .sort((account1, account2) =>
  //         account1.parsed.mint.toBase58().localeCompare(account2.parsed.mint.toBase58())
  //       );
  //   }

  //   async createTokenAccount(tokenAddress: PublicKey) {
  //     return await createAndInitializeTokenAccount({
  //       connection: this.connection,
  //       payer: this,
  //       mintPublicKey: tokenAddress,
  //       newAccount: new Keypair()
  //     });
  //   }

  //   async createAssociatedTokenAccount(splTokenMintAddress: PublicKey) {
  //     return await createAssociatedTokenAccount({
  //       connection: this.connection,
  //       wallet: this,
  //       splTokenMintAddress
  //     });
  //   }

  //   async tokenAccountCost() {
  //     return this.connection.getMinimumBalanceForRentExemption(ACCOUNT_LAYOUT.span);
  //   }

  //   async transferToken(
  //     source: PublicKey,
  //     destination: PublicKey,
  //     amount: number,
  //     mint: PublicKey | null, // transfer sol no need
  //     decimals: number,
  //     memo = null,
  //   ) {
  //     if (source.equals(this.publicKey)) {
  //       if (memo) {
  //         throw new Error('Memo not implemented');
  //       }
  //       return this.transferSol(destination, amount);
  //     }
  //     if (!mint) throw new Error('mint invalid');
  // return await transferTokens({
  //   connection: this.connection,
  //   owner: this,
  //   sourcePublicKey: source,
  //   destinationPublicKey: destination,
  //   amount,
  //   memo,
  //   mint,
  //   decimals,
  //   overrideDestinationCheck
  // });
  //   }

  //   async transferSol(destination: PublicKey, amount: number) {
  // return nativeTransfer(this.connection, this, destination, amount);
  //   }

  //   async closeTokenAccount(publicKey: PublicKey, skipPreflight = false) {
  // return await closeTokenAccount({
  //   connection: this.connection,
  //   owner: this,
  //   sourcePublicKey: publicKey,
  //   skipPreflight
  // });
  //   }

  //   async signTransaction(transaction: Transaction) {
  // return this.provider.signTransaction(transaction);
  //   }

  async createSignature(message: Uint8Array) {
    return this.provider.createSignature(message);
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
