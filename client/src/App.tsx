import { Canvas } from "@react-three/fiber";
import { OrbitControls, Torus } from "@react-three/drei";
import { World } from "./world/World";
import { Suspense } from "react";
import { Physics, RigidBody } from "@react-three/rapier";
import { SEA_LEVEL } from "./world/dummyChunk";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas>
        <Suspense>
          <Physics debug>
            <OrbitControls makeDefault enablePan />
            <ambientLight intensity={Math.PI / 2} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              decay={0}
              intensity={Math.PI}
            />
            <pointLight
              position={[-10, -10, -10]}
              decay={0}
              intensity={Math.PI}
            />
            <World />

            <RigidBody colliders={"hull"} position={[0, SEA_LEVEL + 60, 0]}>
              <Torus />
            </RigidBody>
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
