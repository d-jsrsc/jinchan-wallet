import { Adapter, WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import {
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from "@solana/wallet-adapter-sollet";

import { JinchanWalletAdapter } from "@jsrsc/wallet-adapter-jinchan";

export interface WalletsConfig {
  network?: WalletAdapterNetwork;
}

export function getWalletAdapters({
  network = WalletAdapterNetwork.Mainnet,
}: WalletsConfig = {}): Adapter[] {
  return [
    new PhantomWalletAdapter(),
    new SolletExtensionWalletAdapter({ network }),
    new SolletWalletAdapter({ network }),
    new JinchanWalletAdapter({ network }),
    // new JinchanExtensionWalletAdapter({ network }),
  ];
}
