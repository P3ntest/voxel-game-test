import { useEffect, useMemo, useRef } from "react";
import { chunkGeometryData, terrainTextureSheet } from "./chunkLogic";
import { BufferAttribute, BufferGeometry, DoubleSide, Mesh } from "three";
import { useChunk } from "./worldStore";
import { RigidBody, TrimeshCollider } from "@react-three/rapier";
import { terrainBodies } from "../util/worldUtils";
import { CELL_SIZE } from "../../../server/src/common/world";

export function Chunk({ x, y, z }: { x: number; y: number; z: number }) {
  const chunk = useChunk(x, y, z);

  const meshRef = useRef<Mesh>(null!);

  useEffect(() => {
    const body = meshRef.current;
    if (meshRef.current) {
      terrainBodies.add(body);
    }
    return () => {
      terrainBodies.delete(body);
    };
  }, [meshRef.current]);

  const geoData = useMemo(() => {
    if (!chunk) {
      return null;
    }
    const { vertices, normals, indices, uvs } = chunkGeometryData(
      chunk?.blocks
    );

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
    geometry.setAttribute("uv", new BufferAttribute(new Float32Array(uvs), 2));
    geometry.setIndex(indices);
    return {
      geometry,
      indices,
      vertices,
      trimeshArgs: [new Float32Array(vertices), new Uint32Array(indices)] as [
        Float32Array,
        Uint32Array
      ],
    };
  }, [chunk, x, y, z, chunk?.blocks]);

  if (!geoData) {
    return null;
  }

  const { geometry } = geoData;

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        position={[x * CELL_SIZE, y * CELL_SIZE, z * CELL_SIZE]}
      >
        <TrimeshCollider args={geoData.trimeshArgs} />
        <meshLambertMaterial
          attach="material"
          map={terrainTextureSheet}
          side={DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}
