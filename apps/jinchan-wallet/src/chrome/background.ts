import { Channels, Message } from './events';
const responseHandlers = new Map();

let unlockedMnemonic: any;
let unlockedMnemonicSetTime = Date.now();

function launchPopup(
  message: {
    channel: Channels;
    data: Message;
    method: 'set' | 'get';
  },
  sender: chrome.runtime.MessageSender,
  sendResponse: (args0: any) => void
) {
  if (!sender.origin) return;

  const searchParams = new URLSearchParams();
  searchParams.set('origin', sender.origin);
  searchParams.set('network', message.data.params.network);
  searchParams.set('request', JSON.stringify(message.data));

  chrome.windows.getLastFocused((focusedWindow) => {
    const left = focusedWindow.left! + focusedWindow.width! - 450;
    chrome.windows.create({
      url: 'popup.html#' + searchParams.toString(),
      type: 'popup',
      width: 360,
      height: 600,
      top: focusedWindow.top,
      left: left,
      focused: true
    });
  });

  responseHandlers.set(message.data.id, sendResponse);
}

function handleConnect(
  message: {
    channel: Channels;
    data: Message;
    method: 'set' | 'get';
  },
  sender: chrome.runtime.MessageSender,
  sendResponse: (args0: any) => void
) {
  chrome.storage.local.get('connectedWallets', (result) => {
    console.log('background.js handleConnect connectedWallets result', result, sender.origin);
    if (!sender.origin) return;

    const connectedWallet = (result.connectedWallets || {})[sender.origin];
    console.log('background.js handleConnect connectedWallets connectedWallet', connectedWallet);
    if (!connectedWallet) {
      launchPopup(message, sender, sendResponse);
    } else {
      sendResponse({
        method: 'connected',
        params: {
          publicKey: connectedWallet.publicKey,
          autoApprove: connectedWallet.autoApprove
        },
        id: message.data.id
      });
    }
  });
}

function handleDisconnect(message: any, sender: any, sendResponse: any) {
  chrome.storage.local.get('connectedWallets', (result) => {
    console.log('background.js handleDisconnect', JSON.stringify(result));
    delete result.connectedWallets[sender.origin];
    chrome.storage.local.set({ connectedWallets: result.connectedWallets }, () =>
      sendResponse({ method: 'disconnected', id: message.data.id })
    );
  });
}

chrome.runtime.onMessage.addListener(
  (
    message: {
      channel: Channels;
      data: Message;
      method: 'set' | 'get';
    },
    sender: chrome.runtime.MessageSender,
    sendResponse: (args0: any) => void
  ) => {
    console.log('background.js - chrome.runtime.onMessage.addListener:', { message });
    if (message.channel === Channels.CONTENT_BACKGROUND_CHANNEL) {
      if (message.data.method === 'connect') {
        handleConnect(message, sender, sendResponse);
      } else if (message.data.method === 'disconnect') {
        handleDisconnect(message, sender, sendResponse);
      } else {
        launchPopup(message, sender, sendResponse);
      }
      // keeps response channel open
      return true;
    } else if (message.channel === Channels.EXTENSION_BACKGROUND_CHANNEL) {
      const responseHandler = responseHandlers.get(message.data.id);
      responseHandlers.delete(message.data.id);
      responseHandler(message.data);
    } else if (message.channel === Channels.EXTENSION_MNEMONIC_CHANNEL) {
      if (message.method === 'set') {
        console.log('unlockedMnemonic set', message.data);
        unlockedMnemonic = message.data;
        unlockedMnemonicSetTime = Date.now();
      } else if (message.method === 'get') {
        console.log('unlockedMnemonic get', unlockedMnemonic);
        if (unlockedMnemonicSetTime + 5 * 60 * 1000 > Date.now()) {
          sendResponse(unlockedMnemonic);
        } else {
          sendResponse('');
        }
      }
    }
    return true;
  }
);
