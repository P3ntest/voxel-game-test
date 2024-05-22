import { Chunk } from "./Chunk";
import { useWorld } from "./worldStore";

export function World() {
  const chunks = useWorld((state) => state.chunks);

  return (
    <>
      {chunks.map((chunk) => (
        <Chunk
          key={`${chunk.x},${chunk.y},${chunk.z}`}
          x={chunk.x}
          y={chunk.y}
          z={chunk.z}
        />
      ))}
    </>
  );
}
