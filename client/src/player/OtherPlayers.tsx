import { useColyseusRoom, useColyseusState } from "../networking/colyseus";
import { useLerped } from "../networking/useLerped";

export function OtherPlayers() {
  const players = useColyseusState((state) => state.players);
  console.log("other players", players);
  const meId = useColyseusRoom()?.sessionId;

  const otherPlayers = Array.from(players?.values() ?? []).filter(
    (player) => player.sessionId !== meId
  );

  return (
    <>
      {otherPlayers.map((player) => (
        <OtherPlayer key={player.sessionId} id={player.sessionId} />
      ))}
    </>
  );
}

function OtherPlayer({ id }: { id: string }) {
  const state = useColyseusState();
  const otherPlayerTransform = state?.players.get(id)?.transform;

  const x = useLerped(otherPlayerTransform?.x ?? 0, 50);
  const y = useLerped(otherPlayerTransform?.y ?? 0, 50);
  const z = useLerped(otherPlayerTransform?.z ?? 0, 50);

  return (
    <mesh position={[x, y, z]}>
      <boxGeometry args={[0.6, 1.8, 0.6]} />
      <meshBasicMaterial color="red" />
    </mesh>
  );
}
