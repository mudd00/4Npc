import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState, useCallback } from 'react';
import { Physics } from '@react-three/rapier';
import Map from './Map';
import Player from './Player';
import type { PlayerHandle } from './Player';
import NPC from './NPC';
import ThirdPersonCamera from './ThirdPersonCamera';
import { NPC_CONFIGS } from '../../types';
import type { NPCConfig } from '../../types';
import type { RelationshipStatus } from '../../lib/api';

interface SceneProps {
  onNearNPC: (npcConfig: NPCConfig | null) => void;
  onPlayerPositionChange: (position: { x: number; y: number; z: number }) => void;
  isInteracting: boolean;
  nearNPC: NPCConfig | null;
  bubbleMessage?: string;
  relationshipStatus?: Record<number, RelationshipStatus>;
}

function SceneContent({ onNearNPC, onPlayerPositionChange, isInteracting, nearNPC, bubbleMessage, relationshipStatus }: SceneProps) {
  const playerRef = useRef<PlayerHandle>(null);
  const cameraAngleRef = useRef(0);
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0, z: 0 });

  const handlePlayerPositionChange = useCallback((position: { x: number; y: number; z: number }) => {
    setPlayerPosition(position);
    onPlayerPositionChange(position);
  }, [onPlayerPositionChange]);

  const handleCameraRotate = (angle: number) => {
    cameraAngleRef.current = angle;
  };

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      <Physics gravity={[0, -20, 0]}>
        <Map />
        <Player
          ref={playerRef}
          cameraAngleRef={cameraAngleRef}
          onPositionChange={handlePlayerPositionChange}
          onNearNPC={onNearNPC}
          npcConfigs={NPC_CONFIGS}
          disabled={isInteracting}
        />

        {/* 4명의 NPC 렌더링 */}
        {NPC_CONFIGS.map((config) => {
          const isThisNPCNear = nearNPC?.id === config.id;
          const showBubble = (isThisNPCNear && !isInteracting) || (isThisNPCNear && !!bubbleMessage);
          const npcRelationship = relationshipStatus?.[config.level];

          return (
            <NPC
              key={config.id}
              config={config}
              isPlayerNear={showBubble}
              bubbleMessage={isThisNPCNear ? bubbleMessage : ''}
              relationshipStatus={npcRelationship}
              playerPosition={isThisNPCNear ? playerPosition : undefined}
            />
          );
        })}
      </Physics>

      <ThirdPersonCamera
        target={playerRef}
        onCameraRotate={handleCameraRotate}
        distance={8}
        height={4}
      />
    </>
  );
}

export default function Scene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 60 }}
      shadows
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
