import { RigidBody } from '@react-three/rapier';

export default function Map() {
  return (
    <group>
      {/* Ground with physics */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.5, 0]}>
          <boxGeometry args={[50, 1, 50]} />
          <meshStandardMaterial color="#4a7c4e" />
        </mesh>
      </RigidBody>

      {/* Grid helper for visual reference */}
      <gridHelper args={[50, 50, '#666', '#444']} position={[0, 0.01, 0]} />

      {/* Trees with collision */}
      {[[-8, 0, -8], [8, 0, -8], [-8, 0, 8], [12, 0, 5]].map((pos, i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={pos as [number, number, number]}>
          <group>
            {/* Trunk */}
            <mesh position={[0, 1, 0]} castShadow>
              <cylinderGeometry args={[0.3, 0.4, 2]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            {/* Leaves */}
            <mesh position={[0, 3, 0]} castShadow>
              <coneGeometry args={[1.5, 3, 8]} />
              <meshStandardMaterial color="#228B22" />
            </mesh>
          </group>
        </RigidBody>
      ))}

      {/* Rocks with collision */}
      {[[3, 0.5, -5], [-5, 0.5, 3]].map((pos, i) => (
        <RigidBody key={`rock-${i}`} type="fixed" colliders="ball" position={pos as [number, number, number]}>
          <mesh castShadow>
            <dodecahedronGeometry args={[0.5]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}
