import { getVoxelOffset, translateGlobalToChunkCoords } from "../common/world";
import { generateChunkData } from "../common/worldGenerator";

export const CELL_SIZE = 16;
export const WORLD_HEIGHT_CELLS = 16;

function chunkKey(x: number, y: number, z: number) {
  return `${x},${y},${z}`;
}

export class Chunk {
  voxels: Uint8Array;

  constructor(public x: number, public y: number, public z: number) {
    this.voxels = generateChunkData(x, y, z);
  }
}

export class WorldManager {
  chunks = new Map<string, Chunk>();

  getChunk(x: number, y: number, z: number) {
    const key = chunkKey(x, y, z);
    if (!this.chunks.has(key)) {
      this.chunks.set(key, new Chunk(x, y, z));
    }

    return this.chunks.get(key);
  }

  setBlock(x: number, y: number, z: number, block: number) {
    const coords = translateGlobalToChunkCoords(x, y, z);
    const chunk = this.getChunk(coords.chunkX, coords.chunkY, coords.chunkZ);
    const index = getVoxelOffset(coords.localX, coords.localY, coords.localZ);
    chunk.voxels[index] = block;
  }
}
