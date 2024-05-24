import { useEffect, useRef } from "react";
import { useLocalPlayer } from "./playerStore";
import { useWorld } from "../world/worldStore";
import { useColyseusRoom } from "../networking/colyseus";
import {
  ClientPackageType,
  ServerPackageType,
} from "../../../server/src/common/packets";
import { useRoomMessageHandler } from "../networking/hooks";

export function ChunkLoader() {
  const playerPos = useLocalPlayer();
  const chunks = useWorld((state) => state.chunks);
  const setChunk = useWorld((state) => state.setChunk);

  const viewDistance = 1;

  const room = useColyseusRoom();

  const loadingChunks = useRef(new Map<string, number>());

  useRoomMessageHandler(ServerPackageType.ChunkData, (message) => {
    const chunkData = new Uint8Array(message.chunk);
    setChunk(message.x, message.y, message.z, chunkData);
  });

  useEffect(() => {
    const chunkKeys = new Set<string>();
    for (const chunk of chunks) {
      chunkKeys.add(`${chunk.x},${chunk.y},${chunk.z}`);
    }

    const playerChunkX = Math.floor(playerPos.x / 16);
    const playerChunkY = Math.floor(playerPos.y / 16);
    const playerChunkZ = Math.floor(playerPos.z / 16);

    for (let x = -viewDistance; x <= viewDistance; x++) {
      for (let y = -viewDistance; y <= viewDistance; y++) {
        for (let z = -viewDistance; z <= viewDistance; z++) {
          const chunkKey = `${playerChunkX + x},${playerChunkY + y},${
            playerChunkZ + z
          }`;
          if (
            !chunkKeys.has(chunkKey) &&
            !loadingChunks.current.has(chunkKey)
          ) {
            loadingChunks.current.set(chunkKey, Date.now());
            room?.send(ClientPackageType.RequestLoadChunk, {
              x: playerChunkX + x,
              y: playerChunkY + y,
              z: playerChunkZ + z,
            });
          }
        }
      }
    }
  }, [playerPos, chunks, room]);

  return <BlockUpdateManager />;
}

function BlockUpdateManager() {
  const setBlock = useWorld((state) => state.setBlock);

  useRoomMessageHandler(ServerPackageType.BlockUpdate, (message) => {
    setBlock(message.x, message.y, message.z, message.type);
  });

  return null;
}
