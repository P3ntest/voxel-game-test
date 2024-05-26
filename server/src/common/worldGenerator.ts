import { createNoise2D, createNoise3D } from "simplex-noise";

import alea from "alea";
import { CELL_SIZE, getVoxelOffset } from "./world";

export const SEA_LEVEL = 0; // the 5th layer in the middl
export const TERRAIN_HEIGHT = 100;
const MOUNTAIN_HEIGHT = 0;

const prng = alea("a");
const noise2d = createNoise2D(prng);
const noise3d = createNoise3D(prng);
function octaveNoise2d(
  x: number,
  y: number,
  octaves: number,
  scale: number = 1,
  offset: number = 0
) {
  let result = 0;
  let amp = 1;
  let freq = 1 / scale;
  let max = 0;

  for (let i = 0; i < octaves; i++) {
    result += noise2d((x + offset) * freq, (y + offset) * freq) * amp;
    max += amp;
    amp /= 2;
    freq *= 2;
  }

  return result / max;
}

function terrainNoise(x: number, y: number) {
  const height = octaveNoise2d(x, y, 8, 500, 200);

  const temperature = octaveNoise2d(x, y, 4, 700, 1000); // used for biome generation

  const stoneHeight = octaveNoise2d(x / 100, y / 100, 4) * 20 + MOUNTAIN_HEIGHT;

  return {
    height,
    temperature,
    stoneHeight,
  };
}

export function generateChunkData(x: number, y: number, z: number) {
  const chunk = new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE);
  const leakingBlocks: number[][] = [];

  // if the chunk is above terrain height, we dont need to generate anything
  if (y >= (TERRAIN_HEIGHT + SEA_LEVEL) / CELL_SIZE) {
    return { chunk, leakingBlocks };
  } else if (y < (SEA_LEVEL - TERRAIN_HEIGHT) / CELL_SIZE) {
    // if the chunk is below the terrain height, we can just fill it with solid blocks
    chunk.fill(3);
    return { chunk, leakingBlocks };
  }

  for (let vX = 0; vX < CELL_SIZE; vX++) {
    for (let vZ = 0; vZ < CELL_SIZE; vZ++) {
      const globalX = x * CELL_SIZE + vX;
      const globalZ = z * CELL_SIZE + vZ;
      const { height, temperature, stoneHeight } = terrainNoise(
        x * CELL_SIZE + vX,
        z * CELL_SIZE + vZ
      );

      const biome = temperature > 0.3 ? "desert" : "forest";

      const yHeight = Math.floor(height * TERRAIN_HEIGHT + SEA_LEVEL);

      for (let vY = 0; vY < CELL_SIZE; vY++) {
        const globalY = y * CELL_SIZE + vY;
        let voxel = 0;
        const delta = yHeight - (y * CELL_SIZE + vY);
        if (delta < 0) continue;
        if (biome === "desert") {
          voxel = 6;
        } else if (biome === "forest") {
          if (yHeight > SEA_LEVEL + stoneHeight) {
            voxel = stoneLikeBlock(globalX, globalY, globalZ);
          } else if (delta == 0) {
            voxel = 1;
          } else if (delta < 3) {
            voxel = 2;
          } else {
            voxel = stoneLikeBlock(globalX, globalY, globalZ);
          }
        }
        chunk[vY * CELL_SIZE * CELL_SIZE + vZ * CELL_SIZE + vX] = voxel;
      }
    }
  }

  const treeBlocks = generateTrees(chunk, x, y, z);

  const allStructureBlocks = [...treeBlocks];

  for (const [lX, lY, lZ, block] of allStructureBlocks) {
    const offset = getVoxelOffset(lX, lY, lZ);
    if (offset !== -1) {
      chunk[offset] = block;
    } else {
      // translate to global coords
      leakingBlocks.push([
        lX + CELL_SIZE * x,
        lY + CELL_SIZE * y,
        lZ + CELL_SIZE * z,
        block,
      ]);
    }
  }

  return {
    chunk,
    leakingBlocks,
  };
}

function stoneLikeBlock(x: number, y: number, z: number) {
  const noise = noise3d(x / 15, y / 15, z / 15);

  if (noise > 0.95) {
    return 7;
  } else {
    return 3;
  }
}

function generateTrees(chunk: Uint8Array, x: number, y: number, z: number) {
  // TODO: nicer
  const treeBlocks: number[][] = [];

  const padding = 5;
  const gen = alea(`${x},${y},${z}`);
  const numTrees = Math.round(gen() * 10);
  const trees = new Array(numTrees).fill({
    x: Math.round(gen() * (CELL_SIZE - 2 * padding) + padding),
    z: Math.round(gen() * (CELL_SIZE - 2 * padding) + padding),
  });
  for (const tree of trees) {
    let y = CELL_SIZE - 1;
    while (y > 0) {
      const offset = getVoxelOffset(tree.x, y, tree.z);
      const currentBlock = chunk[offset];

      if (currentBlock == 1) {
        for (const b of treeStructure()) {
          treeBlocks.push([tree.x + b[0], y + b[1], tree.z + b[2], b[3]]);
        }
        break;
      } else if (currentBlock == 6) {
        for (const b of cactusStructure(
          x * CELL_SIZE + tree.x,
          z * CELL_SIZE + tree.z
        )) {
          treeBlocks.push([tree.x + b[0], y + b[1], tree.z + b[2], b[3]]);
        }
        break;
      }
      y--;
    }
  }

  return treeBlocks;
}

function treeStructure() {
  const treeHeight = Math.round(Math.random() * 6) + 4;
  const numLeaves = Math.round(Math.random() * 2) + 2;

  const leaves = [];
  for (let x = -2; x <= 2; x++) {
    for (let z = -2; z <= 2; z++) {
      for (let y = 0; y <= 2; y++) {
        if (Math.abs(x) + Math.abs(z) + Math.abs(y) > numLeaves) {
          continue;
        }
        leaves.push([x, y + treeHeight, z, 5]);
      }
    }
  }

  const stem = [];
  for (let i = 0; i < treeHeight; i++) {
    stem.push([0, i, 0, 4]);
  }

  const treeStructure = [...leaves, ...stem];

  return treeStructure;
}

function cactusStructure(x: number, z: number) {
  const cactus = [];
  const height = noise2d(x, z) * 3 + 5;
  for (let i = 0; i < height; i++) {
    cactus.push([0, i, 0, 8]);
  }
  return cactus;
}
