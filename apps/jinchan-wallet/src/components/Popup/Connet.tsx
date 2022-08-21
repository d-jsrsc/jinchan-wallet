export default function ConnectPopup({
  origin,
  cancelAction,
  approveAction
}: {
  origin: string;
  cancelAction: () => void;
  approveAction: () => void;
}) {
  return (
    <div>
      <p>connect</p>
      <p>{origin}</p>
      <button onClick={cancelAction}>cancel</button>
      <button onClick={approveAction}>approve</button>
    </div>
  );
}
