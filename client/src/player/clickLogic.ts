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
  // Determine the clicked face based on the face normal.
  //   let face: string;
  //   if (faceNormal.x === 1) {
  //     face = "right";
  //   } else if (faceNormal.x === -1) {
  //     face = "left";
  //   } else if (faceNormal.y === 1) {
  //     face = "top";
  //   } else if (faceNormal.y === -1) {
  //     face = "bottom";
  //   } else if (faceNormal.z === 1) {
  //     face = "front";
  //   } else {
  //     face = "back";
  //   }
  return {
    voxel: clickedVoxel,
    faceVoxel,
  };
}
