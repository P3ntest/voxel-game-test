import { Chunk } from "../game/WorldManager";

export const ClientPackageType = {
  PlayerMoves: 0,
  RequestLoadChunk: 1,
  UpdateBlock: 2,
  RequestSpawn: 3,
};

export const ServerPackageType = {
  ChunkData: 0,
  BlockUpdate: 1,
  TeleportPlayer: 2,
};
