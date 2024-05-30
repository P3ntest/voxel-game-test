import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { World } from "./world/World";
import { Suspense, useEffect } from "react";
import { Physics } from "@react-three/rapier";
import { Player } from "./player/Player";
import { keyboardControlsMap } from "./player/Controls";
import {
  connectToColyseus,
  disconnectFromColyseus,
} from "./networking/colyseus";
import { OtherPlayers } from "./player/OtherPlayers";
import { Broadcaster } from "./networking/Broadcaster";
import { ChunkLoader } from "./player/ChunkLoader";
import { PlayerInventory } from "./ui/PlayerInventory";
import { Sun } from "./world/Sun";

export default function App() {
  useEffect(() => {
    (async () => {
      console.log("connecting to colyseus");
      await connectToColyseus("voxelRoom");
      console.log("connected to colyseus");
    })();

    return () => {
      disconnectFromColyseus();
    };
  }, []);

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
      <PlayerInventory />
      <Canvas>
        <fog attach="fog" args={[0xffffff, 90, 100]} />
        <Broadcaster />
        <KeyboardControls map={keyboardControlsMap}>
          <Suspense>
            <Physics timeStep={1 / 20}>
              <Sun />
              <World />
              <Player />
              <ChunkLoader />
              <OtherPlayers />
            </Physics>
          </Suspense>
        </KeyboardControls>
      </Canvas>
    </div>
  );
}
