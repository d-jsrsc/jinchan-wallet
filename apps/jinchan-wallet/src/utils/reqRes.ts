export type _ReqMsgType =
  | {
      id: 3;
      jsonrpc: '2.0';
      method: 'signTransaction';
      params: {
        message: '87PYrM4jUpRKCgozqfSqJZj2tj1ohgVPkY9nodNYFYhcoKRqdkvbjvBdF46kvFNzMt94qZFcUVJtpavRw5JtFyj6AXS5Gw88BXqRatV1PpY4b4Hf3Y97TMGr23FsywmJLpaiA9VcZmeCSvSiAMTD1MBYKsr4f6qduEXabo53mgoP7LB6RMQ1r145kQFAcTJNV8ZdhStZR4HM';
        network: 'devnet';
      };
    }
  | {
      id: number;
      method: 'connected';
      params: {
        autoApprove: boolean;
        publicKey: string;
      };
    };

export type ResMsgType =
  | {
      id: number;
      method: 'connected';
      params: {
        autoApprove: boolean;
        publicKey: string;
      };
    }
  | {
      result: {
        signature: string;
        publicKey: string;
      };
      id: number;
    }
  | {
      error: string;
      id: number;
    };
