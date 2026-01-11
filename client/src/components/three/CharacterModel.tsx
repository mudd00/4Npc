import { useEffect, useRef, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import * as THREE from 'three';

const IDLE = 'Idle';
const WALK = 'Walk';
const RUN = 'Run';

interface CharacterModelProps {
  isMoving?: boolean;
  scale?: number;
}

export default function CharacterModel({ isMoving = false, scale = 0.8 }: CharacterModelProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF('/models/BaseCharacter.gltf');

  // Clone the scene for each instance to avoid conflicts
  const clonedScene = useMemo(() => {
    const cloned = SkeletonUtils.clone(scene);
    return cloned;
  }, [scene]);

  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  useEffect(() => {
    const idleAction = actions[IDLE];
    if (idleAction) {
      idleAction.reset().fadeIn(0.2).play();
    }
  }, [actions]);

  useEffect(() => {
    const idleAction = actions[IDLE];
    const walkAction = actions[WALK];
    const runAction = actions[RUN];

    const targetAction = isMoving ? (runAction || walkAction) : idleAction;
    if (targetAction) {
      targetAction.setLoop(THREE.LoopRepeat, Infinity);
    }

    const others = [idleAction, walkAction, runAction].filter(Boolean);

    if (!targetAction) return;
    targetAction.reset().fadeIn(0.3).play();
    others.forEach((act) => {
      if (act && act !== targetAction) act.fadeOut(0.3);
    });
  }, [isMoving, actions]);

  return (
    <group ref={group} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/models/BaseCharacter.gltf');
