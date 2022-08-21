import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import React, { FC, useCallback } from "react";
import {
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";

export const SendOneLamportToRandomAddress: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signMessage } = useWallet();

  const sendSol = useCallback(async () => {
    if (!publicKey) throw new WalletNotConnectedError();

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: new PublicKey("4CUZWma3tdDzeLqJTuMKzYt42HHXSQXFu63D74Tya4Y2"),
        lamports: 0.1 * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendTransaction(transaction, connection);
    const result = await connection.confirmTransaction(signature, "processed");
    console.log("result", result);
  }, [publicKey, sendTransaction, connection]);

  const signMsg = useCallback(async () => {
    if (!signMessage) {
      alert(!signMessage);
      return;
    }
    const result = await signMessage(Buffer.from("hello world"));
    const signature = bs58.encode(result);
    console.log(signature);
  }, [signMessage]);

  const sendToken = useCallback(async () => {
    if (!publicKey) return;
    const token = new PublicKey("6umHzVDkm3SW2FzVEzP1iPqrfQZFFTt1HLqUqJVXCCTi");
    const toPubkey = new PublicKey(
      "5ufd1X9spJ9UthyD4yy1vuJ7EGWU68W619wBxWe9SCJT"
      // "2ZNnadBm2WgwUc7BCXuEjT2bi9tHbNv8moYY58xfTz2u"
    );
    const fromTokenAccount = await getAssociatedTokenAddress(token, publicKey);
    const toTokenAccount = await getAssociatedTokenAddress(token, toPubkey);
    console.log({
      fromTokenAccount: fromTokenAccount.toBase58(),
      toTokenAccount: toTokenAccount.toBase58(),
    });
    const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
    const tx = new Transaction();
    if (!toTokenAccountInfo) {
      tx.add(
        createAssociatedTokenAccountInstruction(
          publicKey,
          toTokenAccount,
          toPubkey,
          token
        )
      );
    }
    tx.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        1,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    const signature = await sendTransaction(tx, connection);

    await connection.confirmTransaction(signature, "processed");
    console.log({ signature });
  }, [connection, publicKey, sendTransaction]);

  return (
    <>
      <div>
        <WalletMultiButton />
        <WalletDisconnectButton />
      </div>
      <div>
        <button onClick={sendSol} disabled={!publicKey}>
          Send 1 lamport to a random address!
        </button>
        <button onClick={signMsg} disabled={!publicKey}>
          signMsg
        </button>
        <button onClick={sendToken} disabled={!publicKey}>
          sendToken
        </button>
      </div>
    </>
  );
};
