import { NearestFilter, SRGBColorSpace, TextureLoader } from "three";
import { CELL_SIZE, getVoxelOffset } from "../util/worldUtils";

const TILE_SIZE = 16;
const TILE_TEXTURE_WIDTH = 256;
const TILE_TEXTURE_HEIGHT = 64;

const loader = new TextureLoader();
export const terrainTextureSheet = loader.load("spritesheet.png");
terrainTextureSheet.magFilter = NearestFilter;
terrainTextureSheet.minFilter = NearestFilter;
terrainTextureSheet.colorSpace = SRGBColorSpace;

export function chunkGeometryData(chunkData: Uint8Array) {
  const vertices = [];
  const normals = [];
  const indices = [];
  const uvs = [];

  for (let y = 0; y < CELL_SIZE; ++y) {
    for (let z = 0; z < CELL_SIZE; ++z) {
      for (let x = 0; x < CELL_SIZE; ++x) {
        const voxel = chunkData[getVoxelOffset(x, y, z)];
        if (voxel) {
          const uvVoxel = voxel - 1;
          for (const { dir, corners, uvRow } of VoxelFaces) {
            const neighborPosition = getVoxelOffset(
              x + dir[0],
              y + dir[1],
              z + dir[2]
            );
            if (neighborPosition === -1 || !chunkData[neighborPosition]) {
              const ndx = vertices.length / 3;
              for (const { pos, uv } of corners) {
                vertices.push(pos[0] + x, pos[1] + y, pos[2] + z);
                normals.push(...dir);
                uvs.push(
                  ((uvVoxel + uv[0]) * TILE_SIZE) / TILE_TEXTURE_WIDTH,
                  1 - ((uvRow + 1 - uv[1]) * TILE_SIZE) / TILE_TEXTURE_HEIGHT
                );
              }
              indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
            }
          }
        }
      }
    }
  }

  return { vertices, normals, indices, uvs };
}

const VoxelFaces = [
  {
    // left
    uvRow: 0,
    dir: [-1, 0, 0],
    corners: [
      { pos: [0, 1, 0], uv: [0, 1] },
      { pos: [0, 0, 0], uv: [0, 0] },
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [0, 0, 1], uv: [1, 0] },
    ],
  },
  {
    // right
    uvRow: 0,
    dir: [1, 0, 0],
    corners: [
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [1, 0, 1], uv: [0, 0] },
      { pos: [1, 1, 0], uv: [1, 1] },
      { pos: [1, 0, 0], uv: [1, 0] },
    ],
  },
  {
    // bottom
    uvRow: 1,
    dir: [0, -1, 0],
    corners: [
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 0], uv: [1, 1] },
      { pos: [0, 0, 0], uv: [0, 1] },
    ],
  },
  {
    // top
    uvRow: 2,
    dir: [0, 1, 0],
    corners: [
      { pos: [0, 1, 1], uv: [1, 1] },
      { pos: [1, 1, 1], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 0] },
    ],
  },
  {
    // back
    uvRow: 0,
    dir: [0, 0, -1],
    corners: [
      { pos: [1, 0, 0], uv: [0, 0] },
      { pos: [0, 0, 0], uv: [1, 0] },
      { pos: [1, 1, 0], uv: [0, 1] },
      { pos: [0, 1, 0], uv: [1, 1] },
    ],
  },
  {
    // front
    uvRow: 0,
    dir: [0, 0, 1],
    corners: [
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 1, 1], uv: [0, 1] },
      { pos: [1, 1, 1], uv: [1, 1] },
    ],
  },
];
