// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { Msgs, Message } from './events';

(window as any).jinchanWallet = {
  postMessage: (message: Message) => {
    console.log('jinchanWallet postMessage', message);
    const listener = (
      event: CustomEventInit<{
        id: number;
        method: 'connected' | 'disconnected';
        params: {
          autoApprove: true;
          publicKey: string;
        };
      }>
    ) => {
      console.log('jinchanWallet postMessage listener', event);
      if (event.detail?.id === message.id) {
        window.removeEventListener(Msgs.JINCHAN_WALLET_CONTENT_SCRIPT_MESSAGE, listener);
        window.postMessage(event.detail);
      }
    };
    window.addEventListener(Msgs.JINCHAN_WALLET_CONTENT_SCRIPT_MESSAGE, listener);

    window.dispatchEvent(
      new CustomEvent(Msgs.JINCHAN_WALLET_INJECTED_SCRIPT_MESSAGE, { detail: message })
    );
  }
};
