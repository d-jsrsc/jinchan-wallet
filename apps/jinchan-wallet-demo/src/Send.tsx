import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import React, { FC, useCallback } from "react";

export const SendOneLamportToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  // console.log("SendOneLamportToRandomAddress", { publicKey, sendTransaction });

  const onClick = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("4CUZWma3tdDzeLqJTuMKzYt42HHXSQXFu63D74Tya4Y2"),
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );

    console.log("----");
    const signature = await sendTransaction(transaction, connection);
    console.log("====", signature);
    const result = await connection.confirmTransaction(signature, "processed");
    console.log("result", result);
  }, [publicKey, sendTransaction, connection]);

  return (
    <button onClick={onClick} disabled={!publicKey}>
      Send 1 lamport to a random address!
    </button>
  );
};
