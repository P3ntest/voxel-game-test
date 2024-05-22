export const CELL_SIZE = 16;

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

export function chunkGeometryData(chunkData: Uint8Array) {
  const vertices = [];
  const normals = [];
  const indices = [];

  for (let y = 0; y < CELL_SIZE; ++y) {
    for (let z = 0; z < CELL_SIZE; ++z) {
      for (let x = 0; x < CELL_SIZE; ++x) {
        const voxel = chunkData[getVoxelOffset(x, y, z)];
        if (voxel) {
          for (const { dir, corners } of VoxelFaces) {
            const neighborPosition = getVoxelOffset(
              x + dir[0],
              y + dir[1],
              z + dir[2]
            );
            if (neighborPosition === -1 || !chunkData[neighborPosition]) {
              const ndx = vertices.length / 3;
              for (const pos of corners) {
                vertices.push(pos[0] + x, pos[1] + y, pos[2] + z);
                normals.push(...dir);
              }
              indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
            }
          }
        }
      }
    }
  }

  return { vertices, normals, indices };
}

const VoxelFaces = [
  {
    // left
    dir: [-1, 0, 0],
    corners: [
      [0, 1, 0],
      [0, 0, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
  },
  {
    // right
    dir: [1, 0, 0],
    corners: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
      [1, 0, 0],
    ],
  },
  {
    // bottom
    dir: [0, -1, 0],
    corners: [
      [1, 0, 1],
      [0, 0, 1],
      [1, 0, 0],
      [0, 0, 0],
    ],
  },
  {
    // top
    dir: [0, 1, 0],
    corners: [
      [0, 1, 1],
      [1, 1, 1],
      [0, 1, 0],
      [1, 1, 0],
    ],
  },
  {
    // back
    dir: [0, 0, -1],
    corners: [
      [1, 0, 0],
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    // front
    dir: [0, 0, 1],
    corners: [
      [0, 0, 1],
      [1, 0, 1],
      [0, 1, 1],
      [1, 1, 1],
    ],
  },
];
