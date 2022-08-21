import { LAMPORTS_PER_SOL, Message, ParsedAccountData, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '../../AppProvider';
import { decodeMessage } from '../../utils/transactions';

type Trans =
  | {
      data: { fromPubkey: PublicKey; toPubkey: PublicKey; lamports: bigint };
      rawData: '3Bxs411Dtc7pkFQj';
      type: 'systemTransfer';
    }
  | {
      data: { amount: bigint; destination: PublicKey; source: PublicKey; owner: PublicKey };
      rawData: string;
      type: 'transfer';
    };

export default function SignTxPopup({
  origin,
  message,
  cancelAction,
  approveAction
}: {
  origin: string;
  message: Uint8Array;
  cancelAction: () => void;
  approveAction: () => void;
}) {
  console.log({ message });
  const wallet = useWallet();
  const [msg, setMsg] = useState<Trans>();

  const [mint, setMint] = useState('');
  const [done, setDone] = useState(false);
  const [hasErr, setHasErr] = useState(false);

  const [fee, setFee] = useState(0);
  const [loadingFee, setLoadingFee] = useState(false);

  const loadTransFee = useCallback(
    async (msg: Message) => {
      if (!wallet) return;
      setLoadingFee(true);
      const data = await wallet.connection.getFeeForMessage(msg);
      setFee(data.value / LAMPORTS_PER_SOL);
      setLoadingFee(false);
    },
    [wallet, message]
  );

  const decodeMsg = useCallback(
    async (solMsg: Message) => {
      if (!wallet) return;
      const msgs = await decodeMessage(wallet.connection, wallet, solMsg);
      if (!msgs) return;
      const simulateResult = await wallet.connection.simulateTransaction(solMsg);
      if (simulateResult.value.err) {
        setHasErr(true);
        return;
      }
      const msg = msgs[0] as Trans;
      setMsg(msg);
      if (msg.type == 'transfer') {
        const data = await wallet.connection.getParsedAccountInfo(msg.data.source);
        const parsedAccount = data.value?.data as ParsedAccountData;
        console.log(parsedAccount.parsed.info.mint);
        setMint(parsedAccount.parsed.info.mint);
      }

      setDone(true);
    },
    [wallet]
  );

  useEffect(() => {
    if (!wallet) return;
    setDone(false);
    const solanaMsg = Message.from(message);
    loadTransFee(solanaMsg);
    decodeMsg(solanaMsg);
  }, [wallet]);

  let showInfo = null;
  if (msg?.type === 'systemTransfer') {
    showInfo = (
      <div>
        form
        <p>{msg.data.fromPubkey.toBase58()}</p>
        to
        <p>{msg.data.toPubkey.toBase58()}</p>
        <p>{(Number(msg.data.lamports || 0) / LAMPORTS_PER_SOL).toFixed(6)} SOL</p>
      </div>
    );
  }

  if (msg?.type === 'transfer') {
    showInfo = (
      <div>
        <p>mint: {mint}</p>
        <p>amount: {Number(msg.data.amount)}</p>
        <p>owner: {msg.data.owner.toBase58()}</p>
        <p>source: {msg.data.source.toBase58()}</p>
        <p>destination: {msg.data.destination.toBase58()}</p>
      </div>
    );
  }

  return (
    <div>
      <p>connect</p>
      <p>{origin}</p>
      {(hasErr && <div>Some Err</div>) || (
        <div>
          <p>{done + ''}</p>
          <br />
          {showInfo}
        </div>
      )}
      <button onClick={cancelAction}>cancel</button>
      <button onClick={approveAction}>approve</button>

      <div>
        <p>fee: {(loadingFee && 'loading') || fee} SOL</p>
      </div>
    </div>
  );
}
