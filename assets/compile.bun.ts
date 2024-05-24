import { blockTextures } from "./blockTextures";
import jimp from "jimp";

const allAvailableTextures = Array.from(
  new Set(
    Object.values(blockTextures).flatMap((block) =>
      Object.values(block).flatMap((texture) =>
        Array.isArray(texture) ? texture : [texture]
      )
    )
  )
);

const TEXTURE_SIZE = 16;

// the total images is allAvailableTextures.length
// we want to create a square texture atlas that is as small as possible
// while still being able to fit all the images
const atlasWidth = Math.ceil(Math.sqrt(allAvailableTextures.length));
const atlasHeight = Math.ceil(allAvailableTextures.length / atlasWidth);

const result = new jimp(atlasWidth * TEXTURE_SIZE, atlasHeight * TEXTURE_SIZE);

let x = 0;
let y = 0;

type Tile = {
  x: number;
  y: number;
};

const atlas: Record<string, Tile> = {};

for (const availableTexture of allAvailableTextures) {
  const texturePath = `./source/terrain/${availableTexture}.png`;
  const texture = await jimp.read(texturePath).catch(() => {
    console.error(`Could not load texture: ${texturePath}`);
    return new jimp(TEXTURE_SIZE, TEXTURE_SIZE);
  });
  result.composite(texture, x * TEXTURE_SIZE, y * TEXTURE_SIZE);
  atlas[availableTexture] = { x, y };
  x++;
  if (x >= atlasWidth) {
    x = 0;
    y++;
  }
}

result.write("../client/public/terrainAtlas.png");

export type BlockUvAtlas = [Tile, Tile, Tile, Tile, Tile, Tile];
const blockAtlas: Record<string, BlockUvAtlas> = {};

for (const block of Object.keys(blockTextures)) {
  const textures = blockTextures[block];
  const sides = Array.isArray(textures.sides)
    ? textures.sides
    : new Array(4).fill(textures.sides);
  blockAtlas[block] = [
    atlas[textures.top],
    atlas[textures.bottom],
    atlas[sides[0]],
    atlas[sides[1]],
    atlas[sides[2]],
    atlas[sides[3]],
  ];
}

console.log(
  JSON.stringify({
    map: blockAtlas,
    width: atlasWidth * TEXTURE_SIZE,
    height: atlasHeight * TEXTURE_SIZE,
    textureSize: TEXTURE_SIZE,
  })
);
