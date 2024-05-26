import { Vector3 } from "three";

export function calculateClickPosition(
  intersectionPoint: Vector3,
  faceNormal: Vector3
) {
  // Calculate the voxel coordinates using rounding.
  const clickedVoxel = intersectionPoint
    .clone()
    .add(faceNormal.clone().multiplyScalar(-0.5))
    .floor();
  const faceVoxel = intersectionPoint
    .clone()
    .add(faceNormal.clone().multiplyScalar(0.5))
    .floor();
  return {
    voxel: clickedVoxel,
    faceVoxel,
  };
}
