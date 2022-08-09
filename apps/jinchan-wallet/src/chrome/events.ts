export enum Msgs {
  JINCHAN_WALLET_CONTENT_SCRIPT_MESSAGE = 'jinchan_wallet_content_script_message',
  JINCHAN_WALLET_INJECTED_SCRIPT_MESSAGE = 'jinchan_wallet_injected_script_message'
}

export enum Channels {
  CONTENT_BACKGROUND_CHANNEL = 'jinchan_wallet_content_script_background_channel',
  EXTENSION_BACKGROUND_CHANNEL = 'jinchan_wallet_extension_background_channel',
  EXTENSION_MNEMONIC_CHANNEL = 'jinchan_wallet_extension_mnemonic_channel'
}

export type Message = {
  id: number; // 1
  jsonrpc: '2.0';
  method:
    | 'connect'
    | 'disconnect'
    | 'sign'
    | 'diffieHellman'
    | 'signTransaction'
    | 'signAllTransactions';
  params: {
    network: 'testnet' | 'devnet' | 'mainnet-beta';
    data: Uint8Array | any;
    display: 'utf8' | 'hex';
    publicKey: string;
    message: string;
    messages: any[];
  };
};
