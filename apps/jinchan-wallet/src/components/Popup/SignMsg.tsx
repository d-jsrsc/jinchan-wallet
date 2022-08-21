import { useMemo } from 'react';

export default function SignMsgPopup({
  origin,
  messageDisplay,
  message,
  cancelAction,
  approveAction
}: {
  origin: string;
  messageDisplay: 'utf8' | 'hex';
  message: Uint8Array;
  cancelAction: () => void;
  approveAction: () => void;
}) {
  const msg = useMemo(() => {
    if (messageDisplay === 'utf8') {
      return Buffer.from(message).toString();
    }
    return 'hex msg TODO!';
  }, [messageDisplay, message]);
  return (
    <div>
      <p>connect</p>
      <p>{origin}</p>
      <p>{msg}</p>
      <button onClick={cancelAction}>cancel</button>
      <button onClick={approveAction}>approve</button>
    </div>
  );
}
