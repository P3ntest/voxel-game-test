import { useMemo, useState } from "react";
import { CELL_SIZE, chunkGeometryData } from "./chunkLogic";
import { BufferAttribute, BufferGeometry } from "three";
import { useChunk } from "./worldStore";
import { RigidBody } from "@react-three/rapier";

export function Chunk({ x, y, z }: { x: number; y: number; z: number }) {
  const chunk = useChunk(x, y, z);

  const color = useState(Math.random() * 0xffffff)[0];

  const geoData = useMemo(() => {
    if (!chunk) {
      return null;
    }
    const { vertices, normals, indices } = chunkGeometryData(chunk?.blocks);

    if (vertices.length === 0) {
      return null;
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
    geometry.setIndex(indices);
    return { geometry, indices, vertices };
  }, [chunk]);

  if (!geoData) {
    return null;
  }

  const { geometry } = geoData;

  return (
    <RigidBody type="fixed" colliders="trimesh">
      <mesh
        geometry={geometry}
        position={[x * CELL_SIZE, y * CELL_SIZE, z * CELL_SIZE]}
      >
        <meshLambertMaterial attach="material" color={color} />
      </mesh>
    </RigidBody>
  );
}
