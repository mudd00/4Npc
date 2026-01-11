import { Canvas } from '@react-three/fiber';
import { Suspense, useRef, useState } from 'react';
import { Physics } from '@react-three/rapier';
import Map from './Map';
import Player, { PlayerHandle } from './Player';
import NPC from './NPC';
import ThirdPersonCamera from './ThirdPersonCamera';

interface SceneProps {
  onNearNPC: (isNear: boolean) => void;
  onPlayerPositionChange: (position: { x: number; y: number; z: number }) => void;
  isChatOpen: boolean;
}

const NPC_POSITION = { x: 5, y: 0, z: 0 };

function SceneContent({ onNearNPC, onPlayerPositionChange, isChatOpen }: SceneProps) {
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
          npcPosition={NPC_POSITION}
          disabled={isChatOpen}
        />
        <NPC position={[NPC_POSITION.x, NPC_POSITION.y, NPC_POSITION.z]} />
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
