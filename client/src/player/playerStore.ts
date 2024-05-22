import { create } from "zustand";

interface PlayerStore {
  x: number;
  y: number;
  z: number;

  setPos: (x: number, y: number, z: number) => void;
}

export const useLocalPlayer = create<PlayerStore>((set) => ({
  x: 0,
  y: 0,
  z: 0,

  setPos: (x, y, z) => set({ x, y, z }),
}));
