// import type { BlockUvAtlas } from "./../../../assets/compile.bun";
import terrainAtlas from "../assets/terrainAtlas.json";
type BlockInfo = {
  id: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textureAtlas: any; //BlockUvAtlas;
};

export const blockInfos: BlockInfo[] = [
  {
    id: 1,
    texture: "grass",
  },
  {
    id: 2,
    texture: "dirt",
  },
  {
    id: 3,
    texture: "stone",
  },
  {
    id: 4,
    texture: "log",
  },
  {
    id: 5,
    texture: "leaves",
  },
  {
    id: 6,
    texture: "sand",
  },
  {
    id: 7,
    texture: "copperOre",
  },
  {
    id: 8,
    texture: "cactus",
  },
  {
    id: 9,
    texture: "andesite",
  },
  {
    id: 10,
    texture: "diorite",
  },
  {
    id: 11,
    texture: "ice",
  },
  {
    id: 12,
    texture: "blue_ice",
  },
  {
    id: 13,
    texture: "packed_ice",
  },
  {
    id: 14,
    texture: "snow",
  },
].map((blockInfo) => ({
  ...blockInfo,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  textureAtlas: (terrainAtlas.map as unknown as Record<string, any>)[
    blockInfo.texture
  ],
}));

export const blockByIdMap: Record<number, BlockInfo> = blockInfos.reduce(
  (map, block) => {
    return {
      ...map,
      [block.id]: block,
    };
  },
  {}
);
