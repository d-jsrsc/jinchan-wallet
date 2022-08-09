import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
export default function Test() {
  const wallet = useWallet();

  return (
    <div>
      <WalletMultiButton />
      <WalletDisconnectButton />
      <button
        onClick={() => {
          if (wallet.signMessage) wallet.signMessage(Buffer.from("hi"));
        }}
      >
        signMsg
      </button>
    </div>
  );
}
