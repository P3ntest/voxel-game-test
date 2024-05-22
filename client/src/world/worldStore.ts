import { create } from "zustand";
import {
  getVoxelOffset,
  translateGlobalToChunkCoords,
} from "../../../server/src/common/world";

type Chunk = {
  x: number;
  y: number;
  z: number;
  blocks: Uint8Array;
};

interface WorldStore {
  chunks: Chunk[];
  setChunk: (x: number, y: number, z: number, blocks: Uint8Array) => void;
  setBlock: (x: number, y: number, z: number, block: number) => void;
}

export const useWorld = create<WorldStore>((set) => ({
  chunks: [],
  setChunk: (x: number, y: number, z: number, blocks: Uint8Array) =>
    set((state) => ({
      chunks: [
        ...state.chunks.filter((c) => c.x !== x || c.y !== y || c.z !== z),
        { x, y, z, blocks },
      ],
    })),
  setBlock: (x: number, y: number, z: number, block: number) =>
    set((state) => {
      const coords = translateGlobalToChunkCoords(x, y, z);
      const chunk = state.chunks.find(
        (c) =>
          c.x === coords.chunkX &&
          c.y === coords.chunkY &&
          c.z === coords.chunkZ
      );
      if (!chunk) {
        return state;
      }
      const newBlocks = new Uint8Array(chunk.blocks);
      const index = getVoxelOffset(coords.localX, coords.localY, coords.localZ);
      newBlocks[index] = block;
      return {
        chunks: [
          ...state.chunks.filter(
            (c) =>
              c.x !== coords.chunkX ||
              c.y !== coords.chunkY ||
              c.z !== coords.chunkZ
          ),
          {
            x: coords.chunkX,
            y: coords.chunkY,
            z: coords.chunkZ,
            blocks: newBlocks,
          },
        ],
      };
    }),
}));

export function useChunk(x: number, y: number, z: number) {
  return useWorld((state) =>
    state.chunks.find((c) => c.x === x && c.y === y && c.z === z)
  );
}
