import { NearestFilter, SRGBColorSpace, TextureLoader } from "three";
import { CELL_SIZE, getVoxelOffset } from "../../../server/src/common/world";

import terrainAtlas from "../assets/terrainAtlas.json";
import { blockByIdMap } from "./blockInfo";

const TILE_SIZE = terrainAtlas.textureSize;
const TILE_TEXTURE_WIDTH = terrainAtlas.width;
const TILE_TEXTURE_HEIGHT = terrainAtlas.height;

const loader = new TextureLoader();
export const terrainTextureSheet = loader.load("terrainAtlas.png");
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
          const blockInfo = blockByIdMap[voxel] ?? blockByIdMap[1];
          for (const { dir, corners, uvIndex } of VoxelFaces) {
            const uvTile = blockInfo.textureAtlas[uvIndex];
            const uvVoxel = uvTile.x;
            const uvRow = uvTile.y;

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
    uvIndex: 2,
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
    uvIndex: 4,
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
    uvIndex: 1,
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
    uvIndex: 0,
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
    uvIndex: 3,
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
    uvIndex: 5,
    dir: [0, 0, 1],
    corners: [
      { pos: [0, 0, 1], uv: [0, 0] },
      { pos: [1, 0, 1], uv: [1, 0] },
      { pos: [0, 1, 1], uv: [0, 1] },
      { pos: [1, 1, 1], uv: [1, 1] },
    ],
  },
];
