import { create } from "zustand";

interface PlayerStore {
  x: number;
  y: number;
  z: number;

  setPos: (x: number, y: number, z: number) => void;

  spawned: boolean;
  setSpawned: (spawned: boolean) => void;

  chunksLoaded: boolean;
  setChunksLoaded: (loaded: boolean) => void;
}

export const useLocalPlayer = create<PlayerStore>((set) => ({
  x: 0,
  y: 0,
  z: 0,

  setPos: (x, y, z) => set({ x, y, z }),

  spawned: false,
  setSpawned: (spawned) => set({ spawned }),

  chunksLoaded: false,
  setChunksLoaded: (loaded) => set({ chunksLoaded: loaded }),
}));
