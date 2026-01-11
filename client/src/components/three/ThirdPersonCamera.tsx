import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { PlayerHandle } from './Player';

const DEFAULT_CAMERA_DISTANCE = 10;
const DEFAULT_CAMERA_HEIGHT = 6;
const SMOOTH_FACTOR_XZ = 5;
const SMOOTH_FACTOR_Y = 2;
const MOUSE_SENSITIVITY = 0.002;
const ROTATION_SMOOTHING = 10;

interface ThirdPersonCameraProps {
  target: React.RefObject<PlayerHandle | null>;
  onCameraRotate: (angle: number) => void;
  distance?: number;
  height?: number;
}

export default function ThirdPersonCamera({
  target,
  onCameraRotate,
  distance = DEFAULT_CAMERA_DISTANCE,
  height = DEFAULT_CAMERA_HEIGHT,
}: ThirdPersonCameraProps) {
  const { camera, gl } = useThree();
  const currentPosition = useRef(new THREE.Vector3());
  const smoothTargetY = useRef(0);

  const targetAzimuth = useRef(0);
  const targetElevation = useRef(0.3);
  const currentAzimuth = useRef(0);
  const currentElevation = useRef(0.3);

  useEffect(() => {
    const canvas = gl.domElement;

    const handleClick = () => {
      canvas.requestPointerLock();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        targetAzimuth.current -= e.movementX * MOUSE_SENSITIVITY;
        targetElevation.current += e.movementY * MOUSE_SENSITIVITY;
        targetElevation.current = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, targetElevation.current));
      }
    };

    canvas.addEventListener('click', handleClick);
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('click', handleClick);
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gl]);

  useFrame((_, delta) => {
    if (!target?.current) return;

    const safeDelta = Math.min(delta, 0.1);

    // Rotation smoothing
    const rotationAlpha = 1 - Math.exp(-ROTATION_SMOOTHING * safeDelta);
    currentAzimuth.current += (targetAzimuth.current - currentAzimuth.current) * rotationAlpha;
    currentElevation.current += (targetElevation.current - currentElevation.current) * rotationAlpha;

    const targetPosition = new THREE.Vector3();
    target.current.getWorldPosition(targetPosition);

    // Y-axis smoothing
    const yLerpAlpha = 1 - Math.exp(-SMOOTH_FACTOR_Y * safeDelta);
    smoothTargetY.current += (targetPosition.y - smoothTargetY.current) * yLerpAlpha;

    // 3rd person mode
    const horizontalDistance = distance * Math.cos(currentElevation.current);
    const offsetX = horizontalDistance * Math.sin(currentAzimuth.current);
    const offsetZ = horizontalDistance * Math.cos(currentAzimuth.current);
    const offsetY = height + distance * Math.sin(currentElevation.current);

    const desiredPosition = new THREE.Vector3(
      targetPosition.x + offsetX,
      smoothTargetY.current + offsetY,
      targetPosition.z + offsetZ
    );

    const xzLerpAlpha = 1 - Math.exp(-SMOOTH_FACTOR_XZ * safeDelta);
    currentPosition.current.lerp(desiredPosition, xzLerpAlpha);
    camera.position.copy(currentPosition.current);

    // Look at character
    camera.lookAt(targetPosition.x, smoothTargetY.current, targetPosition.z);

    // Pass camera rotation to Player
    if (onCameraRotate) {
      onCameraRotate(currentAzimuth.current);
    }
  });

  return null;
}
