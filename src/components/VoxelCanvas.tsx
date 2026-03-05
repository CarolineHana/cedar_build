"use client";

import { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import type { VoxelGrid, VoxelKey } from "@/types/voxel";
import { GRID_PLANE_SIZE } from "@/lib/constants";
import type { MaterialId } from "@/lib/materials";
import { key } from "@/types/voxel";
import { VoxelGridMesh } from "./VoxelGridMesh";
import { VoxelPointer } from "./VoxelPointer";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface VoxelCanvasProps {
  voxels: VoxelGrid;
  setVoxels: React.Dispatch<React.SetStateAction<VoxelGrid>>;
  selectedColor: string;
  material: MaterialId;
  paletteForMaterial: string[];
  onBlockPlaced?: (key: VoxelKey) => void;
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function VoxelCanvas({
  voxels,
  setVoxels,
  selectedColor,
  material,
  paletteForMaterial,
  onBlockPlaced,
}: VoxelCanvasProps) {
  const [point, setPoint] = useState<THREE.Vector3 | null>(null);
  const [normal, setNormal] = useState<THREE.Vector3 | null>(null);

  const addVoxel = useCallback(
    (pos: THREE.Vector3, color: string) => {
      const k = key(pos.x, pos.y, pos.z);
      setVoxels((prev) => {
        const next = new Map(prev);
        next.set(k, { color });
        return next;
      });
    },
    [setVoxels]
  );

  const placeFromEvent = (e: { point: THREE.Vector3; face?: { normal: THREE.Vector3 } | null }, offset: number) => {
    const n = (e.face?.normal ?? new THREE.Vector3(0, 1, 0)).clone();
    const pos = e.point.clone().add(n.multiplyScalar(offset));
    const voxX = Math.floor(pos.x);
    const voxY = Math.floor(pos.y);
    const voxZ = Math.floor(pos.z);
    const voxKey = key(voxX, voxY, voxZ);
    if (!voxels.has(voxKey)) {
      addVoxel(new THREE.Vector3(voxX, voxY, voxZ), selectedColor);
      onBlockPlaced?.(voxKey);
    }
  };

  const handleVoxelClick = useCallback(
    (e: unknown) => {
      (e as { stopPropagation: () => void }).stopPropagation();
      placeFromEvent(e as { point: THREE.Vector3; face?: { normal: THREE.Vector3 } | null }, 0.001);
    },
    [voxels, addVoxel, selectedColor, onBlockPlaced]
  );

  const handleGroundClick = useCallback(
    (e: unknown) => {
      (e as { stopPropagation: () => void }).stopPropagation();
      placeFromEvent(e as { point: THREE.Vector3; face?: { normal: THREE.Vector3 } | null }, 0.001);
    },
    [voxels, addVoxel, selectedColor, onBlockPlaced]
  );

  const updatePointNormal = useCallback((newPoint: THREE.Vector3, newNormal: THREE.Vector3) => {
    setPoint(newPoint);
    setNormal(newNormal);
  }, []);

  return (
    <div className="w-full h-full bg-[var(--bg)] overflow-hidden">
      <Canvas
        camera={{ position: [12, 12, 12], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => {
          setPoint(null);
          setNormal(null);
        }}
      >
        <color attach="background" args={["#f5f3f0"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 15, 10]} intensity={1} castShadow />
        <directionalLight position={[-10, 10, -10]} intensity={0.4} />

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          minDistance={4}
          maxDistance={120}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2 + 0.2}
        />

        <Grid
          args={[GRID_PLANE_SIZE, GRID_PLANE_SIZE]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#ffffff"
          sectionSize={4}
          sectionThickness={1}
          sectionColor="#ffffff"
          position={[0, -0.08, 0]}
        />

        <mesh
          position={[0, 0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          onPointerMove={(e: unknown) => {
            const ev = e as { point: THREE.Vector3; stopPropagation?: () => void };
            ev.stopPropagation?.();
            updatePointNormal(ev.point.clone(), new THREE.Vector3(0, 1, 0));
          }}
          onPointerLeave={() => {
            setPoint(null);
            setNormal(null);
          }}
          onClick={handleGroundClick}
        >
          <planeGeometry args={[GRID_PLANE_SIZE, GRID_PLANE_SIZE]} />
          <meshBasicMaterial visible={false} />
        </mesh>

        <VoxelGridMesh
          voxels={voxels}
          materialPreset={material}
          onPointerEnter={(e: unknown) => {
            const ev = e as { point: THREE.Vector3; face?: { normal: THREE.Vector3 } | null; stopPropagation?: () => void };
            ev.stopPropagation?.();
            updatePointNormal(ev.point.clone(), ev.face?.normal?.clone() ?? new THREE.Vector3(0, 1, 0));
          }}
          onPointerMove={(e: unknown) => {
            const ev = e as { point: THREE.Vector3; face?: { normal: THREE.Vector3 } | null; stopPropagation?: () => void };
            ev.stopPropagation?.();
            updatePointNormal(ev.point.clone(), ev.face?.normal?.clone() ?? new THREE.Vector3(0, 1, 0));
          }}
          onPointerLeave={() => {
            setPoint(null);
            setNormal(null);
          }}
          onClick={handleVoxelClick}
        />

        {point && normal && (
          <VoxelPointer
            point={point}
            normal={normal}
            color={selectedColor}
          />
        )}
      </Canvas>
    </div>
  );
}
