import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import CharacterModel from './CharacterModel';
import SpeechBubble from './SpeechBubble';
import type { NPCConfig } from '../../types';
import type { RelationshipStatus } from '../../lib/api';

// 호감도 레벨별 아이콘
const AFFINITY_ICONS: Record<string, string> = {
  stranger: '😐',
  acquaintance: '🙂',
  friend: '😊',
  close_friend: '💜',
};

interface NPCProps {
  config: NPCConfig;
  isPlayerNear?: boolean;
  bubbleMessage?: string;
  relationshipStatus?: RelationshipStatus;
  playerPosition?: { x: number; y: number; z: number };
}

export default function NPC({ config, isPlayerNear = false, bubbleMessage = '', relationshipStatus, playerPosition }: NPCProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { position, name, role, level, colorTheme, greeting } = config;

  // 플레이어가 가까이 오면 바라보기
  useFrame(() => {
    if (!groupRef.current || !playerPosition || !isPlayerNear) return;

    // 플레이어 방향 계산
    const npcPos = new THREE.Vector3(position[0], position[1], position[2]);
    const playerPos = new THREE.Vector3(playerPosition.x, position[1], playerPosition.z);

    // 플레이어를 바라보는 방향 계산
    const direction = new THREE.Vector3().subVectors(playerPos, npcPos).normalize();
    const targetAngle = Math.atan2(direction.x, direction.z);

    // 부드러운 회전 (lerp)
    const currentRotation = groupRef.current.rotation.y;
    const newRotation = THREE.MathUtils.lerp(currentRotation, targetAngle, 0.1);
    groupRef.current.rotation.y = newRotation;
  });

  return (
    <RigidBody type="fixed" colliders="ball" position={position}>
      <group ref={groupRef}>
        {/* NPC Character Model */}
        <CharacterModel isMoving={false} scale={0.8} />

        {/* Level Badge - 머리 위 */}
        <Billboard position={[0, 3.2, 0]} follow={true}>
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

        {/* 관계 상태 표시 (Level 3: 기억함, Level 4: 호감도 아이콘) */}
        {relationshipStatus && (level === 3 || level === 4) && (
          <Billboard position={[0, 3.5, 0]} follow={true}>
            {/* Level 3: 기억함 표시 */}
            {level === 3 && relationshipStatus.hasMemory && (
              <>
                <mesh position={[0, 0, -0.01]}>
                  <planeGeometry args={[1.0, 0.3]} />
                  <meshBasicMaterial color="#22c55e" transparent opacity={0.9} />
                </mesh>
                <Text
                  fontSize={0.12}
                  color="#ffffff"
                  anchorX="center"
                  anchorY="middle"
                  fontWeight="bold"
                >
                  기억함 ✓
                </Text>
              </>
            )}
            {/* Level 4: 호감도 아이콘 */}
            {level === 4 && relationshipStatus.affinityLevel && (
              <>
                <mesh position={[0, 0, -0.01]}>
                  <planeGeometry args={[0.5, 0.4]} />
                  <meshBasicMaterial color={colorTheme.secondary} transparent opacity={0.9} />
                </mesh>
                <Text
                  fontSize={0.25}
                  anchorX="center"
                  anchorY="middle"
                >
                  {AFFINITY_ICONS[relationshipStatus.affinityLevel] || '😐'}
                </Text>
              </>
            )}
          </Billboard>
        )}

        {/* NPC Name Tag */}
        <Billboard position={[0, 2.8, 0]} follow={true}>
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
          position={[0, 4.0, 0]}
          npcName={name}
          colorTheme={colorTheme}
          defaultGreeting={greeting}
        />
      </group>
    </RigidBody>
  );
}
