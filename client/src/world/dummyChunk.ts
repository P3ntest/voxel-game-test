import { createNoise2D } from "simplex-noise";
import { CELL_SIZE } from "../util/worldUtils";
import alea from "alea";

export const SEA_LEVEL = 0; // the 5th layer in the middl
const TERRAIN_HEIGHT = CELL_SIZE;

const prng = alea("seed");
const noise2d = createNoise2D(prng);

export function generateDummyChunk(x: number, y: number, z: number) {
  const chunk = new Uint8Array(CELL_SIZE * CELL_SIZE * CELL_SIZE);

  // if the chunk is above terrain height, we dont need to generate anything
  if (y >= (TERRAIN_HEIGHT + SEA_LEVEL) / CELL_SIZE) {
    return chunk;
  } else if (y < (SEA_LEVEL - TERRAIN_HEIGHT) / CELL_SIZE) {
    // if the chunk is below the terrain height, we can just fill it with solid blocks
    chunk.fill(4);
    return chunk;
  }

  for (let vX = 0; vX < CELL_SIZE; vX++) {
    for (let vZ = 0; vZ < CELL_SIZE; vZ++) {
      const height = noise2d(
        (x * CELL_SIZE + vX) / 100,
        (z * CELL_SIZE + vZ) / 100
      );

      const yHeight = Math.floor(height * TERRAIN_HEIGHT + SEA_LEVEL);

      for (let vY = 0; vY < CELL_SIZE; vY++) {
        if (y * CELL_SIZE + vY < yHeight) {
          chunk[vY * CELL_SIZE * CELL_SIZE + vZ * CELL_SIZE + vX] = 4;
        }
      }
    }
  }

  return chunk;
}
