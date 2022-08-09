import { EventEmitter } from 'events';
import { randomBytes, secretbox } from 'tweetnacl';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import { pbkdf2 } from 'pbkdf2';
import * as bip32 from 'bip32';
// import * as ecc from 'tiny-secp256k1';
// You must wrap a tiny-secp256k1 compatible implementation
// const bip32 = BIP32Factory(ecc);

import { DerivationPath, MnemonicAndSeed } from './types';
import { isExtension } from '..';
import { Channels } from '../../chrome/events';

export const walletSeedChanged = new EventEmitter();

export const EMPTY_MNEMONIC: MnemonicAndSeed = {
  mnemonic: null,
  seed: null,
  importsEncryptionKey: undefined,
  derivationPath: DerivationPath.deprecated
};

export let unlockedMnemonicAndSeed: Promise<MnemonicAndSeed> = (async () => {
  const unlockedExpiration = localStorage.getItem('unlockedExpiration');

  if (unlockedExpiration && Number(unlockedExpiration) < Date.now()) {
    localStorage.removeItem('unlocked');
    localStorage.removeItem('unlockedExpiration');
  }

  const stored = JSON.parse(
    (await getExtensionUnlockedMnemonic()) || localStorage.getItem('unlocked') || 'null'
  );
  console.log({ stored });
  if (stored === null) {
    return EMPTY_MNEMONIC;
  }
  const data = {
    importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
    ...stored
  };
  console.log('unlockedMnemonicAndSeed', data);
  return data;
})();

function deriveImportsEncryptionKey(seed: string): Buffer | undefined {
  // SLIP16 derivation path.
  return bip32.fromSeed(Buffer.from(seed, 'hex')).derivePath("m/10016'/0").privateKey;
}

async function getExtensionUnlockedMnemonic() {
  if (!isExtension) {
    return null;
  }

  return new Promise<void>((resolve) => {
    chrome.runtime.sendMessage(
      {
        channel: Channels.EXTENSION_MNEMONIC_CHANNEL,
        method: 'get'
      },
      (resp) => {
        console.log('getExtensionUnlockedMnemonic', resp);
        resolve(resp);
      }
    );
  });
}

export function getUnlockedMnemonicAndSeed() {
  return unlockedMnemonicAndSeed;
}

export function forgetWallet() {
  localStorage.clear();
  sessionStorage.removeItem('unlocked');
  if (isExtension)
    chrome.runtime.sendMessage({
      channel: Channels.EXTENSION_MNEMONIC_CHANNEL,
      method: 'set',
      data: ''
    });
  unlockedMnemonicAndSeed = Promise.resolve<MnemonicAndSeed>({
    mnemonic: null,
    seed: null,
    importsEncryptionKey: undefined
  });
  walletSeedChanged.emit('change', unlockedMnemonicAndSeed);

  chrome.storage.local.clear(() => window.location.reload());
}

export function normalizeMnemonic(mnemonic: string) {
  return mnemonic.trim().split(/\s+/g).join(' ');
}

export async function generateMnemonicAndSeed() {
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString('hex') };
}

export async function mnemonicToSeed(mnemonic: string) {
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed).toString('hex');
}

export async function storeMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  password: string,
  derivationPath: DerivationPath
): Promise<void> {
  const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });
  if (password) {
    const salt = randomBytes(16);
    const kdf = 'pbkdf2';
    const iterations = 100000;
    const digest = 'sha256';
    const key: Uint8Array = await deriveEncryptionKey(password, salt, iterations, digest);
    const nonce = randomBytes(secretbox.nonceLength);
    const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
    localStorage.setItem(
      'locked',
      JSON.stringify({
        encrypted: bs58.encode(encrypted),
        nonce: bs58.encode(nonce),
        kdf,
        salt: bs58.encode(salt),
        iterations,
        digest
      })
    );
    localStorage.removeItem('unlocked');
  } else {
    localStorage.setItem('unlocked', plaintext);
    localStorage.removeItem('locked');
  }
  sessionStorage.removeItem('unlocked');

  if (isExtension)
    chrome.runtime.sendMessage({
      channel: Channels.EXTENSION_MNEMONIC_CHANNEL,
      method: 'set',
      data: ''
    });

  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  if (!importsEncryptionKey) throw new Error('!importsEncryptionKey');
  setUnlockedMnemonicAndSeed(mnemonic, seed, importsEncryptionKey, derivationPath);
}

async function deriveEncryptionKey(
  password: string,
  salt: Uint8Array,
  iterations: number,
  digest: string
): Promise<Uint8Array> {
  console.log({ password, salt, iterations, digest });
  return new Promise((resolve, reject) =>
    pbkdf2(password, salt, iterations, secretbox.keyLength, digest, (err, key) =>
      err ? reject(err) : resolve(key)
    )
  );
}

export function setUnlockedMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  importsEncryptionKey: Buffer,
  derivationPath: DerivationPath
) {
  const data = {
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath
  };
  unlockedMnemonicAndSeed = Promise.resolve(data);
  walletSeedChanged.emit('change', data);
}

export async function loadMnemonicAndSeed(password: string): Promise<{
  mnemonic: string;
  seed: string;
  derivationPath: DerivationPath;
}> {
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest
  } = JSON.parse(localStorage.getItem('locked') || '');
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error('Incorrect password');
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext) as MnemonicAndSeed;
  if (!mnemonic || !seed || !derivationPath)
    throw new Error('!mnemonic || !seed || !derivationPath');
  if (isExtension) {
    chrome.runtime.sendMessage({
      channel: Channels.EXTENSION_MNEMONIC_CHANNEL,
      method: 'set',
      data: decodedPlaintext
    });
  } else {
    sessionStorage.setItem('unlocked', decodedPlaintext);
  }
  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  if (!importsEncryptionKey) throw new Error('!importsEncryptionKey');
  setUnlockedMnemonicAndSeed(mnemonic, seed, importsEncryptionKey, derivationPath);
  return { mnemonic, seed, derivationPath };
}
