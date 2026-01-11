import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import CharacterModel from './CharacterModel';

interface NPCProps {
  position: [number, number, number];
}

export default function NPC({ position }: NPCProps) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <RigidBody type="fixed" colliders="ball" position={position}>
      <group ref={groupRef}>
        {/* NPC Character Model */}
        <CharacterModel isMoving={false} scale={0.8} />

        {/* NPC Name Tag */}
        <Billboard position={[0, 2.5, 0]} follow={true}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.5, 0.4]} />
            <meshBasicMaterial color="#1e293b" transparent opacity={0.85} />
          </mesh>
          <Text
            fontSize={0.2}
            color="#f472b6"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.02}
            outlineColor="#000000"
          >
            마을 안내원
          </Text>
        </Billboard>
      </group>
    </RigidBody>
  );
}
