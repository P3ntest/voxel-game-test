import { create } from "zustand";
import { generateDummyChunk } from "./dummyChunk";

type Chunk = {
  x: number;
  y: number;
  z: number;
  blocks: Uint8Array;
};

interface WorldStore {
  chunks: Chunk[];
  setChunk: (x: number, y: number, z: number, blocks: Uint8Array) => void;
}

export const useWorld = create<WorldStore>(
  (set) =>
    ({
      chunks: [],
      setChunk: (x: number, y: number, z: number, blocks: Uint8Array) =>
        set((state) => ({
          chunks: [
            ...state.chunks.filter((c) => c.x !== x || c.y !== y || c.z !== z),
            { x, y, z, blocks },
          ],
        })),
    } as WorldStore)
);

export function generateWorld() {
  const WORLD_SIZE = 4;

  const min = Math.ceil(-WORLD_SIZE / 2);
  const max = Math.ceil(WORLD_SIZE / 2);

  for (let x = min; x < max; ++x) {
    for (let y = min; y < max; ++y) {
      for (let z = min; z < max; ++z) {
        console.log("Generating chunk", x, y, z);
        useWorld.getState().setChunk(x, y, z, generateDummyChunk(x, y, z));
      }
    }
  }
}

generateWorld();

export function useChunk(x: number, y: number, z: number) {
  return useWorld((state) =>
    state.chunks.find((c) => c.x === x && c.y === y && c.z === z)
  );
}
