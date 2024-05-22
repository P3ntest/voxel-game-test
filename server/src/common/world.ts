export const CELL_SIZE = 16;
export const WORLD_HEIGHT_CELLS = 16;

export function translateGlobalToChunkCoords(x: number, y: number, z: number) {
  const chunkX = Math.floor(x / CELL_SIZE);
  const chunkY = Math.floor(y / CELL_SIZE);
  const chunkZ = Math.floor(z / CELL_SIZE);
  const localX = ((x % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
  const localY = ((y % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
  const localZ = ((z % CELL_SIZE) + CELL_SIZE) % CELL_SIZE;
  return {
    chunkX,
    chunkY,
    chunkZ,
    localX,
    localY,
    localZ,
  };
}

export function getVoxelOffset(x: number, y: number, z: number) {
  if (
    x < 0 ||
    y < 0 ||
    z < 0 ||
    x >= CELL_SIZE ||
    y >= CELL_SIZE ||
    z >= CELL_SIZE
  ) {
    return -1;
  }
  return y * CELL_SIZE * CELL_SIZE + z * CELL_SIZE + x;
}
