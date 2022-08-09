import React, { FC, useMemo } from "react";

// import { test } from '@jsrsc/test-lib';

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import { JinchanWalletAdapter } from "@jsrsc/wallet-adapter-jinchan";
import { SendOneLamportToRandomAddress } from "./Send";
import Test from "./Test";

// import { SendOneLamportToRandomAddress } from "./Demo";

// Default styles that can be overridden by your app
require("@solana/wallet-adapter-react-ui/styles.css");

export const Wallet: FC = () => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  const network = WalletAdapterNetwork.Testnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // new SolletWalletAdapter({ network }),
      // new SolletExtensionWalletAdapter({ network }),

      new JinchanWalletAdapter({ network }),
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Test />
          {/* Your app's components go here, nested within the context providers. */}
          {/* <SendOneLamportToRandomAddress /> */}
          <SendOneLamportToRandomAddress />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
