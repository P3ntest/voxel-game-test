import { useEffect, useRef } from "react";
import { useLocalPlayer } from "./playerStore";
import { useWorld } from "../world/worldStore";
import { useColyseusRoom } from "../networking/colyseus";
import {
  ClientPackageType,
  ServerPackageType,
} from "../../../server/src/common/packets";
import { decompressChunk } from "../../../server/src/common/compression";
import { useRoomMessageHandler } from "../networking/hooks";
import { CELL_SIZE } from "../../../server/src/common/world";

export function ChunkLoader() {
  const playerPos = useLocalPlayer();
  const chunks = useWorld((state) => state.chunks);
  const setChunk = useWorld((state) => state.setChunk);

  const viewDistance = 2;

  const room = useColyseusRoom();

  const loadingChunks = useRef(new Map<string, number>());

  useRoomMessageHandler(ServerPackageType.ChunkData, (message) => {
    const chunkData = new Uint8Array(message.chunk);
    setChunk(message.x, message.y, message.z, decompressChunk(chunkData));
  });

  console.debug("render chunk loader");
  console.debug({
    playerPos,
    chunks,
    room,
    loadingChunks,
  });

  useEffect(() => {
    if (!room) {
      console.debug("no room");
    }
    const chunkKeys = new Set<string>();
    for (const chunk of chunks) {
      chunkKeys.add(`${chunk.x},${chunk.y},${chunk.z}`);
    }

    const playerChunkX = Math.floor(playerPos.x / CELL_SIZE);
    const playerChunkY = Math.floor(playerPos.y / CELL_SIZE);
    const playerChunkZ = Math.floor(playerPos.z / CELL_SIZE);

    // let allChunksLoaded = true;

    // remove loading chunks that timed out
    for (const [key, time] of loadingChunks.current) {
      if (Date.now() - time > 5000) {
        loadingChunks.current.delete(key);
      }
    }

    console.debug("pre loop", {
      playerChunkX,
      playerChunkY,
      playerChunkZ,
      viewDistance,
      chunkKeys,
      loadingChunks,
    });

    for (let x = -viewDistance; x <= viewDistance; x++) {
      for (let y = -viewDistance; y <= viewDistance; y++) {
        for (let z = -viewDistance; z <= viewDistance; z++) {
          const chunkKey = `${playerChunkX + x},${playerChunkY + y},${
            playerChunkZ + z
          }`;
          console.debug("loop", { x, y, z, chunkKey });
          if (
            !chunkKeys.has(chunkKey) &&
            !loadingChunks.current.has(chunkKey)
          ) {
            loadingChunks.current.set(chunkKey, Date.now());
            console.debug("requesting chunk", { x, y, z });
            room?.send(ClientPackageType.RequestLoadChunk, {
              x: playerChunkX + x,
              y: playerChunkY + y,
              z: playerChunkZ + z,
            });
          }
        }
      }
    }

    // despawn chunks that are too far away
    for (const chunk of chunks) {
      const chunkX = chunk.x;
      const chunkY = chunk.y;
      const chunkZ = chunk.z;
      const distance = Math.hypot(
        chunkX - playerChunkX,
        chunkY - playerChunkY,
        chunkZ - playerChunkZ
      );
      if (distance > viewDistance * 3) {
        console.debug("despawning chunk", { chunkX, chunkY, chunkZ });
        setChunk(chunk.x, chunk.y, chunk.z, null);
        loadingChunks.current.delete(`${chunkX},${chunkY},${chunkZ}`);
      }
    }
  }, [room, playerPos, chunks, setChunk]);

  return <BlockUpdateManager />;
}

function BlockUpdateManager() {
  const setBlock = useWorld((state) => state.setBlock);

  useRoomMessageHandler(ServerPackageType.BlockUpdate, (message) => {
    setBlock(message.x, message.y, message.z, message.type);
  });

  return null;
}
