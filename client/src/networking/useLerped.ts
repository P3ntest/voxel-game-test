import { useFrame } from "@react-three/fiber";
import { useState } from "react";

export function lerp(
  start: number,
  end: number,
  factor: number,
  deltaTime: number
) {
  return start + (end - start) * factor * deltaTime;
}

export function useLerped(value: number, factor: number) {
  const [lerped, setLerped] = useState(value);

  useFrame((_, delta) => {
    setLerped((lerped) => lerped + (value - lerped) * factor * delta);
  });

  return lerped;
}

export function useLerpedRadian(value: number, factor: number) {
  const [lerped, setLerped] = useState(value);

  useFrame((_, deltaTime) => {
    setLerped((lerped) => {
      const diff = value - lerped;
      const delta =
        Math.atan2(Math.sin(diff), Math.cos(diff)) * factor * deltaTime;
      return lerped + delta;
    });
  });

  return lerped;
}
