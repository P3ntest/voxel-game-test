import {
  OrthographicCamera,
  PerspectiveCamera,
  Stage,
} from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import {
  TILE_SIZE,
  TILE_TEXTURE_HEIGHT,
  TILE_TEXTURE_WIDTH,
  VoxelFaces,
  terrainTextureSheet,
} from "../world/chunkLogic";
import { useMemo } from "react";
import { BufferAttribute, BufferGeometry } from "three";
import { blockByIdMap, blockInfos } from "../world/blockInfo";

export function BlockItemRenderer({ itemId }: { itemId: number }) {
  const geoData = useMemo(() => {
    const uvs = [];
    const vertices = [];
    const normals = [];
    const indices = [];

    const blockInfo = blockByIdMap[itemId] ?? blockByIdMap[1];

    // generate one basic cube
    for (const { dir, corners, uvIndex } of VoxelFaces) {
      const uvTile = blockInfo.textureAtlas[uvIndex];
      const uvRow = uvTile.y;
      const uvVoxel = uvTile.x;

      const ndx = vertices.length / 3;
      for (const { pos, uv } of corners) {
        vertices.push(pos[0], pos[1], pos[2]);
        normals.push(...dir);
        uvs.push(
          ((uvVoxel + uv[0]) * TILE_SIZE) / TILE_TEXTURE_WIDTH,
          1 - ((uvRow + 1 - uv[1]) * TILE_SIZE) / TILE_TEXTURE_HEIGHT
        );
      }
      indices.push(ndx, ndx + 1, ndx + 2, ndx + 2, ndx + 1, ndx + 3);
    }

    const geometry = new BufferGeometry();
    const positionNumComponents = 3;
    const normalNumComponents = 3;
    geometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(vertices), positionNumComponents)
    );
    geometry.setAttribute(
      "normal",
      new BufferAttribute(new Float32Array(normals), normalNumComponents)
    );
    geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
    geometry.setIndex(indices);

    return { geometry };
  }, [itemId]);

  return (
    <Canvas frameloop="demand">
      <ambientLight intensity={Math.PI / 2} />
      <directionalLight position={[0, 10, 0]} intensity={1} />
      <OrthographicCamera
        makeDefault
        position={[0, 0, 3]}
        rotation={[0, 0, 0]}
        scale={0.035}
        near={0.1}
        far={1000}
      />
      <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <mesh
          geometry={geoData.geometry}
          position={[-0.5, -0.5, -0.5]}
          // have a point look at the camera
        >
          <meshStandardMaterial color="orange" map={terrainTextureSheet} />
        </mesh>
      </group>
    </Canvas>
  );
}
