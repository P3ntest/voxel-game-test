import { ServerPackageType } from "../common/packets";
import { getVoxelOffset, translateGlobalToChunkCoords } from "../common/world";
import {
  SEA_LEVEL,
  TERRAIN_HEIGHT,
  generateChunkData,
} from "../common/worldGenerator";
import { VoxelRoom } from "../rooms/VoxelRoom";

export const WORLD_HEIGHT_CELLS = 16;

function chunkKey(x: number, y: number, z: number) {
  return `${x},${y},${z}`;
}

export class Chunk {
  voxels: Uint8Array;

  constructor(
    public world: WorldManager,
    public x: number,
    public y: number,
    public z: number
  ) {
    const { chunk, leakingBlocks } = generateChunkData(x, y, z);
    this.voxels = chunk;
    for (const [x, y, z, block] of leakingBlocks) {
      world.setBlock(x, y, z, block);
    }
  }
}

export class WorldManager {
  chunks = new Map<string, Chunk>();

  _futureBlocks = new Map<string, Set<number[]>>();

  constructor(private room: VoxelRoom) {}

  generateChunk(x: number, y: number, z: number) {
    const key = chunkKey(x, y, z);
    const chunk = new Chunk(this, x, y, z);
    if (this._futureBlocks.has(key)) {
      for (const [localX, localY, localZ, block] of this._futureBlocks.get(
        key
      )) {
        const index = getVoxelOffset(localX, localY, localZ);
        chunk.voxels[index] = block;
      }
      this._futureBlocks.delete(key);
    }
    this.chunks.set(key, chunk);
    return chunk;
  }

  getExistingChunk(x: number, y: number, z: number) {
    const key = chunkKey(x, y, z);
    return this.chunks.get(key);
  }

  getChunk(x: number, y: number, z: number) {
    const key = chunkKey(x, y, z);
    if (!this.chunks.has(key)) {
      return this.generateChunk(x, y, z);
    }

    return this.chunks.get(key);
  }

  setBlock(x: number, y: number, z: number, block: number) {
    const coords = translateGlobalToChunkCoords(x, y, z);
    const chunk = this.getExistingChunk(
      coords.chunkX,
      coords.chunkY,
      coords.chunkZ
    );
    if (!chunk) {
      const key = chunkKey(coords.chunkX, coords.chunkY, coords.chunkZ);
      if (!this._futureBlocks.has(key)) {
        this._futureBlocks.set(key, new Set());
      }
      this._futureBlocks
        .get(key)
        .add([coords.localX, coords.localY, coords.localZ, block]);
      return;
    }
    const index = getVoxelOffset(coords.localX, coords.localY, coords.localZ);
    chunk.voxels[index] = block;

    this.room.broadcast(ServerPackageType.BlockUpdate, {
      x,
      y,
      z,
      type: block,
    });
  }

  getBlock(x: number, y: number, z: number) {
    const coords = translateGlobalToChunkCoords(x, y, z);
    const chunk = this.getExistingChunk(
      coords.chunkX,
      coords.chunkY,
      coords.chunkZ
    );
    if (!chunk) {
      return 0;
    }
    const index = getVoxelOffset(coords.localX, coords.localY, coords.localZ);
    return chunk.voxels[index];
  }

  findSpawnableBlock(x: number, z: number) {
    const MAX_HEIGHT = SEA_LEVEL + TERRAIN_HEIGHT + 90;
    const MIN_HEIGHT = SEA_LEVEL - TERRAIN_HEIGHT - 90;
    for (let y = MAX_HEIGHT; y >= MIN_HEIGHT; y--) {
      const coords = translateGlobalToChunkCoords(x, y, z);
      this.getChunk(coords.chunkX, coords.chunkY, coords.chunkZ);
      if (this.getBlock(x, y, z) != 0) {
        return [x, y + 1, z];
      }
    }
    return [x, MAX_HEIGHT, z];
  }
}
