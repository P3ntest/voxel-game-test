import { useMemo, useRef, useState } from "react";
import { Chunk } from "./Chunk";
import { useWorld } from "./worldStore";
import { useFrame } from "@react-three/fiber";
import { useLocalPlayer } from "../player/playerStore";
import { translateGlobalToChunkCoords } from "../../../server/src/common/world";
import { useColyseusRoom } from "../networking/colyseus";
import { ClientPackageType } from "../../../server/src/common/packets";

export function World() {
  const chunks = useWorld((state) => state.chunks);

  // only allow one new chunk to be loaded at a time
  const [visibleChunksIds, setVisibleChunksIds] = useState<string[]>([]);

  useFrame(() => {
    if (visibleChunksIds.length == chunks.length || chunks.length == 0) {
      return;
    }

    const newChunk = chunks.find(
      (chunk) => !visibleChunksIds.includes(`${chunk.x},${chunk.y},${chunk.z}`)
    );
    if (!newChunk) {
      return;
    }
    const allChunkIds = chunks.map(
      (chunk) => `${chunk.x},${chunk.y},${chunk.z}`
    );
    setVisibleChunksIds((prev) => [
      ...prev.filter((id) => allChunkIds.includes(id)),
      `${newChunk.x},${newChunk.y},${newChunk.z}`,
    ]);
  });

  const visibleChunks = useMemo(() => {
    return chunks.filter((chunk) => {
      return visibleChunksIds.includes(`${chunk.x},${chunk.y},${chunk.z}`);
    });
  }, [chunks, visibleChunksIds]);

  return (
    <>
      {visibleChunks.map((chunk) => (
        <Chunk
          key={`${chunk.x},${chunk.y},${chunk.z}`}
          x={chunk.x}
          y={chunk.y}
          z={chunk.z}
        />
      ))}
      <CheckPlayerSpawn
        visibleChunksIds={visibleChunksIds}
        forceDisplay={(id) => {
          if (!visibleChunksIds.includes(id)) {
            setVisibleChunksIds((prev) => [...prev, id]);
          }
        }}
      />
    </>
  );
}

function CheckPlayerSpawn({
  visibleChunksIds,
  forceDisplay,
}: {
  visibleChunksIds: string[];
  forceDisplay: (id: string) => void;
}) {
  const playerPos = useLocalPlayer();
  const coords = translateGlobalToChunkCoords(
    playerPos.x,
    playerPos.y,
    playerPos.z
  );
  const room = useColyseusRoom();
  const requestedSpawn = useRef(false);
  if (
    visibleChunksIds.includes(
      `${coords.chunkX},${coords.chunkY},${coords.chunkZ}`
    ) &&
    !requestedSpawn.current
  ) {
    requestedSpawn.current = true;
    console.log("requesting spawn");
    room?.send(ClientPackageType.RequestSpawn);
  } else if (
    !visibleChunksIds.includes(
      `${coords.chunkX},${coords.chunkY},${coords.chunkZ}`
    )
  ) {
    forceDisplay(`${coords.chunkX},${coords.chunkY},${coords.chunkZ}`);
  }

  return null;
}
