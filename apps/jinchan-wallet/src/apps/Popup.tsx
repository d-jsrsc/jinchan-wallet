// import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { useCallback, useState } from 'react';
import { useWallet } from '../AppProvider';
import { Channels, Message } from '../chrome/events';
import ConnectPopup from '../components/Popup/Connet';
import SignMsgPopup from '../components/Popup/SignMsg';
import SignTxPopup from '../components/Popup/SignTx';
import { ResMsgType } from '../utils/reqRes';
// import { decodeMessage } from '../utils/transactions';
// import { Wallet } from '../Wallet';

export default function App() {
  // params 和 chrome background 里的 launchPop 里呼应
  // #origin=http://localhost:3000&network=testnet&request={"jsonrpc":"2.0","id":1,"method":"connect","params":{"network":"testnet"}}'
  const params = new URLSearchParams(window.location.hash.slice(1));
  const origin = params.get('origin');

  const accounts: any[] = [];
  const wallet = useWallet();
  const [requests, setRequests] = useState(getInitialRequests);

  const popRequest = useCallback(() => setRequests((requests) => requests.slice(1)), [requests]);
  const postMessage = useCallback(
    (message: ResMsgType, cb: () => void) => {
      if (!wallet) return;
      console.log('message', message, 'accounts', accounts);
      chrome.storage.local.get('connectedWallets', (result) => {
        cb();
        console.log('postMessage', result, { accounts });
        if (!accounts) {
          return;
        }
        const account = accounts.find((account: any) => account.address.equals(wallet.publicKey));
        // console.log('postMessage', { account });
        // if (!account) return;
        const connectedWallets = {
          ...(result.connectedWallets || {}),
          [origin as string]: {
            publicKey: wallet.publicKey.toBase58(),
            selector: account?.selector,
            autoApprove: true
          }
        };
        console.log('chrome.storage.local.set({ connectedWallets });', { connectedWallets });
        chrome.storage.local.set({ connectedWallets });
      });
      chrome.runtime.sendMessage({
        channel: Channels.EXTENSION_BACKGROUND_CHANNEL,
        data: message
      });
    },
    [wallet, accounts]
  );

  const request = requests[0];

  if (!origin) return null;
  if (!wallet) return null;
  if (!request) {
    window.close();
    return null;
  }

  const { messages, messageDisplay } = (() => {
    console.log('request', request);
    if (!request || request.method === 'connect') {
      return { messages: [], messageDisplay: 'tx' };
    }
    switch (request.method) {
      case 'diffieHellman':
        return {
          messages: [request.params.publicKey],
          messageDisplay: 'diffieHellman'
        };
      case 'signTransaction':
        return {
          messages: [bs58.decode(request.params.message)],
          messageDisplay: 'tx'
        };
      case 'signAllTransactions':
        return {
          messages: request.params.messages.map((m: any) => bs58.decode(m)),
          messageDisplay: 'tx'
        };
      case 'sign':
        if (!(request.params.data instanceof Uint8Array)) {
          throw new Error('Data must be an instance of Uint8Array');
        }
        return {
          messages: [request.params.data],
          messageDisplay: request.params.display === 'utf8' ? 'utf8' : 'hex'
        };
      default:
        throw new Error('Unexpected method: ' + request.method);
    }
  })();

  console.log({ messages, messageDisplay });

  switch (request.method) {
    case 'connect': {
      return (
        <ConnectPopup
          origin={origin}
          cancelAction={() => {
            postMessage(
              {
                error: 'Transaction cancelled',
                id: request.id
              },
              () => {
                popRequest();
              }
            );
          }}
          approveAction={() => {
            postMessage(
              {
                method: 'connected',
                params: {
                  publicKey: wallet.publicKey.toBase58(),
                  autoApprove: true
                },
                id: request.id
              },
              () => {
                popRequest();
              }
            );
          }}
        />
      );
    }

    // signMsg
    case 'sign': {
      return (
        <SignMsgPopup
          origin={origin}
          messageDisplay={messageDisplay as 'utf8' | 'hex'}
          message={messages[0] as Uint8Array}
          approveAction={async () => {
            postMessage(
              {
                result: {
                  signature: await wallet.createSignature(messages[0] as Uint8Array),
                  publicKey: wallet.publicKey.toBase58()
                },
                id: request.id
              },
              () => {
                popRequest();
              }
            );
          }}
          cancelAction={() => {
            postMessage(
              {
                error: 'Transaction cancelled',
                id: request.id
              },
              () => {
                popRequest();
              }
            );
          }}
        />
      );
    }

    case 'signTransaction': {
      return (
        <SignTxPopup
          origin={origin}
          message={messages[0] as Uint8Array}
          cancelAction={() => {
            postMessage(
              {
                error: 'Transaction cancelled',
                id: request.id
              },
              () => {
                popRequest();
              }
            );
          }}
          approveAction={async () => {
            postMessage(
              {
                result: {
                  signature: await wallet.createSignature(messages[0] as Uint8Array),
                  publicKey: wallet.publicKey.toBase58()
                },
                id: request.id
              },
              () => {
                popRequest();
              }
            );
          }}
        />
      );
    }

    default:
      return <div>Popup</div>;
  }
}

function getInitialRequests() {
  const hashParams = window.location.hash.slice(1);
  const urlParams = new URLSearchParams(hashParams);
  const request: Message = JSON.parse(urlParams.get('request') || '""');
  console.log('getInitialRequests', request);
  if (request.method === 'sign') {
    const dataObj = request.params.data;
    if (!dataObj) {
      throw new Error('Missing "data" params for "sign" request');
    }
    // Deserialize `data` into a Uint8Array
    const data = Uint8Array.from(Object.values(dataObj));
    request.params.data = data;
  }

  return [request];
}
