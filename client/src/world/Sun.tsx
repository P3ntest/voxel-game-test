import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AmbientLight, DirectionalLight } from "three";

export function Sun() {
  const rotation = useRef(0);

  const dlRef = useRef<DirectionalLight>(null);
  const alRef = useRef<AmbientLight>(null);

  useFrame(() => {
    rotation.current += 0.001;

    dlRef.current.position.x = Math.sin(rotation.current) * 10;
    dlRef.current.position.y = Math.cos(rotation.current) * 10;

    alRef.current.intensity =
      (((Math.cos(rotation.current) + 1) / 2) * Math.PI) / 2 + 0.2;

    // sunset color directional light
  });

  return (
    <>
      <ambientLight intensity={Math.PI / 2} ref={alRef} />

      <directionalLight
        ref={dlRef}
        position={[0.1, 0.1, 0.1]}
        intensity={1}
        //   target-position={[0, 0, 0]}
      />
    </>
  );
}
