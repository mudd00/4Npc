import { Canvas } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import { Physics } from '@react-three/rapier';
import Map from './Map';
import Player from './Player';
import type { PlayerHandle } from './Player';
import NPC from './NPC';
import ThirdPersonCamera from './ThirdPersonCamera';
import { NPC_CONFIGS } from '../../types';
import type { NPCConfig } from '../../types';

interface SceneProps {
  onNearNPC: (npcConfig: NPCConfig | null) => void;
  onPlayerPositionChange: (position: { x: number; y: number; z: number }) => void;
  isInteracting: boolean;
  nearNPC: NPCConfig | null;
  bubbleMessage?: string;
}

function SceneContent({ onNearNPC, onPlayerPositionChange, isInteracting, nearNPC, bubbleMessage }: SceneProps) {
  const playerRef = useRef<PlayerHandle>(null);
  const cameraAngleRef = useRef(0);

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
          onPositionChange={onPlayerPositionChange}
          onNearNPC={onNearNPC}
          npcConfigs={NPC_CONFIGS}
          disabled={isInteracting}
        />

        {/* 4명의 NPC 렌더링 */}
        {NPC_CONFIGS.map((config) => {
          const isThisNPCNear = nearNPC?.id === config.id;
          const showBubble = (isThisNPCNear && !isInteracting) || (isThisNPCNear && !!bubbleMessage);

          return (
            <NPC
              key={config.id}
              config={config}
              isPlayerNear={showBubble}
              bubbleMessage={isThisNPCNear ? bubbleMessage : ''}
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
