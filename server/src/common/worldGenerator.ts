import { createNoise2D } from "simplex-noise";

import alea from "alea";
import { CELL_SIZE, getVoxelOffset } from "./world";

export const SEA_LEVEL = 0; // the 5th layer in the middl
const TERRAIN_HEIGHT = CELL_SIZE;

const prng = alea("seed");
const noise2d = createNoise2D(prng);

function terrainNoise(x: number, y: number) {
  return (
    1 * noise2d(x / 150, y / 150) +
    0.4 * noise2d(x / 70, y / 70) +
    0.2 * noise2d(x / 20, y / 20)
  );
}

export function generateChunkData(x: number, y: number, z: number) {
  const chunk = new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE);

  // if the chunk is above terrain height, we dont need to generate anything
  if (y >= (TERRAIN_HEIGHT + SEA_LEVEL) / CELL_SIZE) {
    return chunk;
  } else if (y < (SEA_LEVEL - TERRAIN_HEIGHT) / CELL_SIZE) {
    // if the chunk is below the terrain height, we can just fill it with solid blocks
    chunk.fill(3);
    return chunk;
  }

  for (let vX = 0; vX < CELL_SIZE; vX++) {
    for (let vZ = 0; vZ < CELL_SIZE; vZ++) {
      const height = terrainNoise(x * CELL_SIZE + vX, z * CELL_SIZE + vZ);

      const yHeight = Math.floor(height * (TERRAIN_HEIGHT / 1.6) + SEA_LEVEL);

      for (let vY = 0; vY < CELL_SIZE; vY++) {
        let voxel = 0;
        const delta = yHeight - (y * CELL_SIZE + vY);
        if (delta < 0) continue;
        if (delta == 0) {
          voxel = 1;
        } else if (delta < 3) {
          voxel = 2;
        } else {
          voxel = 3;
        }
        chunk[vY * CELL_SIZE * CELL_SIZE + vZ * CELL_SIZE + vX] = voxel;
      }
    }
  }

  generateTrees(chunk, x, y, z);

  return chunk;
}

function generateTrees(chunk: Uint8Array, x: number, y: number, z: number) {
  // TODO: nicer
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
      const currentBlock = chunk[getVoxelOffset(tree.x, y, tree.z)];

      if (currentBlock == 1) {
        for (const b of treeStructure) {
          chunk[getVoxelOffset(tree.x + b[0], y + b[1], tree.z + b[2])] = b[3];
        }
        break;
      }
      y--;
    }
  }
}

const leaves = [];
for (let x = -2; x <= 2; x++) {
  for (let z = -2; z <= 2; z++) {
    for (let y = 0; y <= 2; y++) {
      leaves.push([x, y + 5, z, 5]);
    }
  }
}

const treeStructure = [
  ...leaves,
  [0, -1, 0, 4],
  [0, 0, 0, 4],
  [0, 1, 0, 4],
  [0, 2, 0, 4],
  [0, 3, 0, 4],
  [0, 4, 0, 4],
  [0, 5, 0, 4],
];
