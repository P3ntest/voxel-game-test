import { Chunk } from "../game/WorldManager";

export const ClientPackageType = {
  PlayerMoves: 0,
  RequestLoadChunk: 1,
  BreakBlock: 2,
  RequestSpawn: 3,
  SelectSlot: 4,
  PlaceBlock: 5,
};

export const ServerPackageType = {
  ChunkData: 0,
  BlockUpdate: 1,
  TeleportPlayer: 2,
};
