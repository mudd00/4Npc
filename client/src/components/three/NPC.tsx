import { useRef } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import CharacterModel from './CharacterModel';
import SpeechBubble from './SpeechBubble';
import type { NPCConfig } from '../../types';

interface NPCProps {
  config: NPCConfig;
  isPlayerNear?: boolean;
  bubbleMessage?: string;
}

export default function NPC({ config, isPlayerNear = false, bubbleMessage = '' }: NPCProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { position, name, role, level, colorTheme, greeting } = config;

  return (
    <RigidBody type="fixed" colliders="ball" position={position}>
      <group ref={groupRef}>
        {/* NPC Character Model */}
        <CharacterModel isMoving={false} scale={0.8} />

        {/* Level Badge - 머리 위 */}
        <Billboard position={[0, 2.9, 0]} follow={true}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.6, 0.3]} />
            <meshBasicMaterial color={colorTheme.primary} transparent opacity={0.95} />
          </mesh>
          <Text
            fontSize={0.15}
            color={colorTheme.accent}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {`Lv.${level}`}
          </Text>
        </Billboard>

        {/* NPC Name Tag */}
        <Billboard position={[0, 2.5, 0]} follow={true}>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.8, 0.5]} />
            <meshBasicMaterial color={colorTheme.primary} transparent opacity={0.9} />
          </mesh>
          {/* 이름 */}
          <Text
            position={[0, 0.08, 0]}
            fontSize={0.18}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
            outlineWidth={0.015}
            outlineColor="#000000"
          >
            {name}
          </Text>
          {/* 역할 */}
          <Text
            position={[0, -0.12, 0]}
            fontSize={0.1}
            color={colorTheme.accent}
            anchorX="center"
            anchorY="middle"
          >
            {role}
          </Text>
        </Billboard>

        {/* Speech Bubble */}
        <SpeechBubble
          show={isPlayerNear}
          message={bubbleMessage}
          position={[0, 3.5, 0]}
          npcName={name}
          colorTheme={colorTheme}
          defaultGreeting={greeting}
        />
      </group>
    </RigidBody>
  );
}
