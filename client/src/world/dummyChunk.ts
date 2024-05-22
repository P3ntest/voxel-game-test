import { createNoise2D } from "simplex-noise";
import { CELL_SIZE } from "./chunkLogic";

export const SEA_LEVEL = 0; // the 5th layer in the middle
const TERRAIN_HEIGHT = CELL_SIZE;

const noise2d = createNoise2D();

export function generateDummyChunk(x: number, y: number, z: number) {
  // if it is below terrain height, return 1
  // if (Math.floor((SEA_LEVEL - TERRAIN_HEIGHT) / CELL_SIZE) >= y) {
  //   return new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE).fill(1);
  // } else if (Math.ceil((SEA_LEVEL + TERRAIN_HEIGHT) / CELL_SIZE) <= y) {
  //   return new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE);
  // }

  const chunk = new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE);

  for (let vX = 0; vX < CELL_SIZE; vX++) {
    for (let vZ = 0; vZ < CELL_SIZE; vZ++) {
      const height = noise2d(
        (x * CELL_SIZE + vX) / 100,
        (z * CELL_SIZE + vZ) / 100
      );

      const yHeight = Math.floor(height * TERRAIN_HEIGHT + SEA_LEVEL);

      for (let vY = 0; vY < CELL_SIZE; vY++) {
        if (y * CELL_SIZE + vY < yHeight) {
          chunk[vY * CELL_SIZE * CELL_SIZE + vZ * CELL_SIZE + vX] = 1;
        }
      }
    }
  }

  return chunk;
}
