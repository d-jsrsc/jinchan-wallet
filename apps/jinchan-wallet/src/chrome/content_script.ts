const container = document.head || document.documentElement;
const scriptTag = document.createElement('script');
scriptTag.setAttribute('async', 'false');
scriptTag.src = chrome.runtime.getURL('wallet_script.js');
container.appendChild(scriptTag);
container.removeChild(scriptTag);

import { Msgs, Channels, Message } from './events';

window.addEventListener(
  Msgs.JINCHAN_WALLET_INJECTED_SCRIPT_MESSAGE,
  (event: CustomEventInit<Message>) => {
    // console.log('Msgs.JINCHAN_WALLET_INJECTED_SCRIPT_MESSAGE', event.detail);
    // id: 1
    // jsonrpc: "2.0"
    // method: "connect"
    // params: {network: 'testnet'}
    if (chrome.runtime.id == undefined) return;
    chrome.runtime.sendMessage(
      {
        channel: Channels.CONTENT_BACKGROUND_CHANNEL,
        data: event.detail
      },
      (
        response:
          | {
              method: 'connected' | 'disconnected';
              params: {
                publicKey: string;
                autoApprove: boolean;
              };
              id: number; // req id
            }
          | undefined
          | null
      ) => {
        // Can return null response if window is killed
        if (!response) {
          return;
        }
        console.log('response', response);
        window.dispatchEvent(
          new CustomEvent(Msgs.JINCHAN_WALLET_CONTENT_SCRIPT_MESSAGE, { detail: response })
        );
      }
    );
  }
);
