import { useEffect, useRef, useState } from 'react';
import { Keypair, Connection, PublicKey } from '@solana/web3.js';
import * as bs58 from 'bs58';
import EventEmitter from 'events';

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useEffectAfterTimeout(effect: () => void, timeout: number) {
  useEffect(() => {
    const handle = setTimeout(effect, timeout);
    return () => clearTimeout(handle);
  });
}

export function useListener(emitter: EventEmitter, eventName: string) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((i) => i + 1);
    emitter.on(eventName, listener);
    return () => {
      emitter.removeListener(eventName, listener);
    };
  }, [emitter, eventName]);
}

export function useRefEqual<T>(value: T, areEqual: (oldValue: T, newValue: T) => boolean): T {
  const prevRef = useRef<T>(value);
  if (prevRef.current !== value && !areEqual(prevRef.current, value)) {
    prevRef.current = value;
  }
  return prevRef.current;
}

export function abbreviateAddress(address: PublicKey) {
  const base58 = address.toBase58();
  return base58.slice(0, 4) + '…' + base58.slice(base58.length - 4);
}

export async function confirmTransaction(connection: Connection, signature: string) {
  const startTime = new Date();
  const result = await connection.confirmTransaction(signature, 'recent');
  if (result.value.err) {
    throw new Error('Error confirming transaction: ' + JSON.stringify(result.value.err));
  }
  console.log('Transaction confirmed after %sms', new Date().getTime() - startTime.getTime());
  return result.value;
}

export const isExtension = window.location.protocol === 'chrome-extension:';

export const isExtensionPopup = isExtension && window.opener;
/**
 * Returns an account object when given the private key
 */
export const decodeAccount = (privateKey: string) => {
  try {
    return Keypair.fromSecretKey(new Uint8Array(JSON.parse(privateKey)));
  } catch (_) {
    try {
      return Keypair.fromSecretKey(new Uint8Array(bs58.decode(privateKey)));
    } catch (_) {
      return undefined;
    }
  }
};

// shorten the checksummed version of the input address to have 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
