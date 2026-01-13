import { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useKeyboardControls } from '../../hooks/useKeyboardControls';
import CharacterModel from './CharacterModel';
import type { NPCConfig } from '../../types';

const WALK_SPEED = 5;
const START_POS: [number, number, number] = [0, 2, 5];
const CHARACTER_SCALE = 0.8;
const CAPSULE_HALF_HEIGHT = 0.8;
const CAPSULE_RADIUS = 0.52;
const CAPSULE_Y_OFFSET = 1.28;

interface PlayerProps {
  cameraAngleRef: React.MutableRefObject<number>;
  onPositionChange: (position: { x: number; y: number; z: number }) => void;
  onNearNPC: (npcConfig: NPCConfig | null) => void;
  npcConfigs: NPCConfig[];
  disabled: boolean;
}

export type PlayerHandle = {
  getWorldPosition: (target: THREE.Vector3) => THREE.Vector3;
};

const Player = forwardRef<PlayerHandle, PlayerProps>(
  ({ cameraAngleRef, onPositionChange, onNearNPC, npcConfigs, disabled }, ref) => {
    const bodyRef = useRef<RapierRigidBody>(null);
    const characterRef = useRef<THREE.Group>(null);
    const currentRotationRef = useRef(new THREE.Quaternion());
    const { forward, backward, left, right } = useKeyboardControls(disabled);
    const [isMoving, setIsMoving] = useState(false);
    const lastMovingRef = useRef(false);
    const lastNearNPCRef = useRef<string | null>(null);

    const INTERACTION_DISTANCE = 3;

    // Expose getWorldPosition for camera
    useImperativeHandle(ref, () => ({
      getWorldPosition: (target: THREE.Vector3) => {
        if (bodyRef.current) {
          const pos = bodyRef.current.translation();
          target.set(pos.x, pos.y, pos.z);
        }
        return target;
      },
    }));

    useFrame(() => {
      const body = bodyRef.current;
      if (!body) return;

      const linvel = body.linvel();
      const pos = body.translation();

      // Respawn if fallen off map
      if (pos.y < -3) {
        body.setTranslation({ x: START_POS[0], y: START_POS[1], z: START_POS[2] }, true);
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        return;
      }

      // Direction based on input
      const direction = new THREE.Vector3();
      if (forward) direction.z -= 1;
      if (backward) direction.z += 1;
      if (left) direction.x -= 1;
      if (right) direction.x += 1;

      const wantsToMove = direction.lengthSq() > 0 && !disabled;

      if (wantsToMove) {
        direction.normalize();

        // Rotate direction by camera angle
        const cameraAngle = cameraAngleRef?.current ?? 0;
        const rotatedDirection = new THREE.Vector3();
        rotatedDirection.x = direction.x * Math.cos(cameraAngle) + direction.z * Math.sin(cameraAngle);
        rotatedDirection.z = direction.z * Math.cos(cameraAngle) - direction.x * Math.sin(cameraAngle);

        // Rotate character to face movement direction
        const targetAngle = Math.atan2(rotatedDirection.x, rotatedDirection.z);
        const targetQuaternion = new THREE.Quaternion().setFromAxisAngle(
          new THREE.Vector3(0, 1, 0),
          targetAngle
        );
        currentRotationRef.current.slerp(targetQuaternion, 0.25);

        body.setRotation(
          {
            x: currentRotationRef.current.x,
            y: currentRotationRef.current.y,
            z: currentRotationRef.current.z,
            w: currentRotationRef.current.w,
          },
          true
        );

        // Set velocity
        body.setLinvel(
          {
            x: rotatedDirection.x * WALK_SPEED,
            y: linvel.y,
            z: rotatedDirection.z * WALK_SPEED,
          },
          true
        );
      } else {
        body.setLinvel({ x: 0, y: linvel.y, z: 0 }, true);
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
      }

      // Update moving state
      if (wantsToMove !== lastMovingRef.current) {
        lastMovingRef.current = wantsToMove;
        setIsMoving(wantsToMove);
      }

      // Callback for position change
      if (onPositionChange) {
        onPositionChange({ x: pos.x, y: pos.y, z: pos.z });
      }

      // Check distance to all NPCs and find nearest one within interaction range
      let nearestNPC: NPCConfig | null = null;
      let nearestDistance = INTERACTION_DISTANCE;

      for (const npc of npcConfigs) {
        const dx = pos.x - npc.position[0];
        const dz = pos.z - npc.position[2];
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestNPC = npc;
        }
      }

      // Only call callback if the nearest NPC changed
      const nearestId = nearestNPC?.id ?? null;
      if (nearestId !== lastNearNPCRef.current) {
        lastNearNPCRef.current = nearestId;
        onNearNPC(nearestNPC);
      }
    });

    return (
      <RigidBody
        ref={bodyRef}
        type="dynamic"
        colliders={false}
        position={START_POS}
        enabledRotations={[false, true, false]}
        mass={1}
        linearDamping={0.5}
      >
        <CapsuleCollider
          args={[CAPSULE_HALF_HEIGHT, CAPSULE_RADIUS]}
          position={[0, CAPSULE_Y_OFFSET, 0]}
          friction={1}
          restitution={0}
        />
        <group ref={characterRef}>
          <CharacterModel isMoving={isMoving} scale={CHARACTER_SCALE} />
        </group>
      </RigidBody>
    );
  }
);

Player.displayName = 'Player';

export default Player;
