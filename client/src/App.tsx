import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { World } from "./world/World";
import { Suspense } from "react";
import { Physics } from "@react-three/rapier";
import { Player } from "./player/Player";
import { keyboardControlsMap } from "./player/Controls";

export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          position: "fixed",
          zIndex: 1,
          pointerEvents: "none",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* crosshair */}
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "100%",
            border: "1px solid white",
            backgroundColor: "black",
            position: "absolute",
          }}
        />
      </div>
      <Canvas>
        <KeyboardControls map={keyboardControlsMap}>
          <Suspense>
            <Physics timeStep={1 / 20}>
              <ambientLight intensity={Math.PI / 2} />
              <directionalLight position={[0, 10, 0]} intensity={1} />
              <World />
              <Player />
            </Physics>
          </Suspense>
        </KeyboardControls>
      </Canvas>
    </div>
  );
}
