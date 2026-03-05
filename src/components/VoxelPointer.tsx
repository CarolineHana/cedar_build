"use client";

import * as THREE from "three";
import { VOXEL_SIZE, VOXEL_GRID_CLEARANCE } from "@/lib/constants";

interface VoxelPointerProps {
  point: THREE.Vector3;
  normal: THREE.Vector3;
  color: string;
}

const HALF = 0.5;
const EPS = 0.001;

export function VoxelPointer({ point, normal, color }: VoxelPointerProps) {
  const step = point.clone().add(normal.clone().multiplyScalar(EPS));
  const pos = new THREE.Vector3(
    Math.floor(step.x) + HALF,
    Math.floor(step.y) + HALF + VOXEL_GRID_CLEARANCE,
    Math.floor(step.z) + HALF
  );

  return (
    <mesh position={pos}>
      <boxGeometry args={[VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
