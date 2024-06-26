import { PerspectiveCamera, useKeyboardControls } from "@react-three/drei";
import {
  CuboidCollider,
  RapierCollider,
  RapierRigidBody,
  RigidBody,
  useAfterPhysicsStep,
  useBeforePhysicsStep,
  useRapier,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Raycaster,
  Vector3,
  type Group,
  type PerspectiveCamera as ThreePerspectiveCamera,
} from "three";
import { Controls, useWalkVector } from "./Controls";
import { Vector } from "../util/Vector";
import { useFrame, useThree } from "@react-three/fiber";
import { useWorld } from "../world/worldStore";
import { calculateClickPosition } from "./clickLogic";
import { terrainBodies } from "../util/worldUtils";
import { useColyseusRoom } from "../networking/colyseus";
import {
  ClientPackageType,
  ServerPackageType,
} from "../../../server/src/common/packets";
import { useLocalPlayer } from "./playerStore";
import { useRoomMessageHandler } from "../networking/hooks";

export function Player() {
  const r = useRapier();
  const characterController = useMemo(() => {
    const controller = r.world.createCharacterController(0.1);
    controller.setSlideEnabled(true);
    return controller;
  }, [r.world]);

  const rbRef = useRef<RapierRigidBody>(null!);
  const colRef = useRef<RapierCollider>(null!);

  const headRef = useRef<Group>(null!);
  const camRef = useRef<ThreePerspectiveCamera>(null!);

  const gravityVelocity = useRef(0);

  const walkVector = useWalkVector();

  const jumping = useKeyboardControls<Controls>((state) => state.jump);

  const room = useColyseusRoom();

  const setLocalPlayerPos = useLocalPlayer((state) => state.setPos);

  const isSpawned = useRef(false);

  useRoomMessageHandler(ServerPackageType.TeleportPlayer, (m) => {
    if (m.playerId == room.sessionId) {
      isSpawned.current = true;
      rbRef.current.setTranslation(
        {
          ...m,
        },
        true
      );
      gravityVelocity.current = 0;
      console.log("got tpd", m);
    }
  });

  useAfterPhysicsStep(() => {
    if (!isSpawned.current) return;

    const grounded = characterController.computedGrounded();
    if (grounded) {
      if (jumping) {
        gravityVelocity.current = -0.5;
      } else gravityVelocity.current = 0;
    } else {
      gravityVelocity.current = Math.min(gravityVelocity.current + 0.1, 2);
    }

    // rotate the walk vector based on the camera rotation
    const headRot = headRef.current.rotation.y;
    const movement = new Vector(walkVector.x, 0, walkVector.z)
      .rotateY(-headRot)
      .normalize()
      .multiplyScalar(0.3);

    characterController.computeColliderMovement(colRef.current, {
      x: -movement.x,
      y: 0 - gravityVelocity.current,
      z: -movement.z,
    });

    const correctedMovement = characterController.computedMovement();
    const currentPos = rbRef.current.translation();
    rbRef.current.setNextKinematicTranslation({
      x: currentPos.x + correctedMovement.x,
      y: currentPos.y + correctedMovement.y,
      z: currentPos.z + correctedMovement.z,
    });

    if (!room) return;
    room.send(ClientPackageType.PlayerMoves, {
      x: rbRef.current.translation().x,
      y: rbRef.current.translation().y,
      z: rbRef.current.translation().z,
    });
    setLocalPlayerPos(
      rbRef.current.translation().x,
      rbRef.current.translation().y,
      rbRef.current.translation().z
    );
  });

  useEffect(() => {
    const moveListener = (e: MouseEvent) => {
      // move the camera based on mouse movement
      const y = headRef.current.rotation.y - e.movementX * 0.002;
      headRef.current.rotation.y = y % (Math.PI * 4);

      const x = camRef.current.rotation.x - e.movementY * 0.002;
      camRef.current.rotation.x = Math.min(
        Math.PI / 2,
        Math.max(-Math.PI / 2, x)
      );
    };
    window.addEventListener("mousemove", moveListener);
    return () => window.removeEventListener("mousemove", moveListener);
  }, []);

  const three = useThree();
  const setBlock = useWorld((state) => state.setBlock);

  const [targetedBlock, setTargetedBlock] = useState<
    [number, number, number] | null
  >(null);
  const targetedFaceBlock = useRef<[number, number, number] | null>(null);
  useFrame(() => {
    const raycaster = new Raycaster();
    const origin = camRef.current.getWorldPosition(new Vector3());
    const direction = camRef.current.getWorldDirection(new Vector3());
    raycaster.set(origin, direction);
    const intersects = raycaster.intersectObjects(three.scene.children, true);
    for (const i of intersects) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!terrainBodies.has(i.object as any)) {
        continue;
      }
      const voxel = calculateClickPosition(i.point, i.face!.normal);
      targetedFaceBlock.current = [
        voxel.faceVoxel.x,
        voxel.faceVoxel.y,
        voxel.faceVoxel.z,
      ];
      if (
        targetedBlock &&
        targetedBlock.every((v, i) => v === voxel.voxel[i])
      ) {
        break;
      }
      setTargetedBlock([voxel.voxel.x, voxel.voxel.y, voxel.voxel.z]);
      break;
    }
  });

  // clicking test
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!e.shiftKey) {
        if (!targetedFaceBlock.current) return;
        room?.send(ClientPackageType.BreakBlock, {
          x: targetedBlock[0],
          y: targetedBlock[1],
          z: targetedBlock[2],
        });
      } else {
        if (!targetedBlock) return;
        room?.send(ClientPackageType.PlaceBlock, {
          x: targetedFaceBlock.current[0],
          y: targetedFaceBlock.current[1],
          z: targetedFaceBlock.current[2],
        });
      }
    };
    window.addEventListener("mousedown", listener);
    return () => window.removeEventListener("mousedown", listener);
  }, [room, targetedBlock]);

  return (
    <>
      <RigidBody
        type="kinematicPosition"
        ref={rbRef}
        position={[10, 20, 10]}
        colliders={false}
      >
        <PointerLock />
        <group ref={headRef} position={[0, 0.7, 0]}>
          <PerspectiveCamera makeDefault ref={camRef} fov={120} />
        </group>
        <CuboidCollider args={[0.3, 0.9, 0.3]} ref={colRef} />
      </RigidBody>
      {targetedBlock && (
        <HighlightBlock position={targetedBlock as [number, number, number]} />
      )}
    </>
  );
}

function HighlightBlock({ position }: { position: [number, number, number] }) {
  return (
    <group position={position.map((v) => v + 0.5) as [number, number, number]}>
      <line>
        <lineBasicMaterial />
      </line>
    </group>
  );
}
function PointerLock() {
  useEffect(() => {
    const canvas = document.querySelector("body");
    const requestPointerLock = () => {
      canvas?.requestPointerLock();
    };
    canvas?.addEventListener("click", requestPointerLock);
    return () => {
      canvas?.removeEventListener("click", requestPointerLock);
    };
  }, []);
  return null;
}
