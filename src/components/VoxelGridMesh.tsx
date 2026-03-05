"use client";

import { useMemo } from "react";
import * as THREE from "three";
import type { VoxelGrid } from "@/types/voxel";
import { parseKey } from "@/types/voxel";
import { VOXEL_SIZE, VOXEL_GRID_CLEARANCE } from "@/lib/constants";
import { getMaterialPreset, type MaterialId } from "@/lib/materials";

// -----------------------------------------------------------------------------
// Cube geometry: 8 corners + 6 faces (2 tris each). BoxGeometry has 24 verts
// (4 per face), so we build from corners for correct merged mesh.
// -----------------------------------------------------------------------------
// Explicit 8 corners of a cube (centered at origin, half-extent h). Three.js BoxGeometry
// has 24 vertices (4 per face), so using it for "8 corners" produced wrong shapes.
// Order: 0=bottom-back-left, 1=bottom-back-right, 2=bottom-front-right, 3=bottom-front-left,
//        4=top-back-left, 5=top-back-right, 6=top-front-right, 7=top-front-left.
const HALF = VOXEL_SIZE / 2;
const CUBE_CORNERS = [
  [-HALF, -HALF, -HALF], [HALF, -HALF, -HALF], [HALF, -HALF, HALF], [-HALF, -HALF, HALF],
  [-HALF, HALF, -HALF], [HALF, HALF, -HALF], [HALF, HALF, HALF], [-HALF, HALF, HALF],
];

// 6 faces, 2 triangles each (CCW when viewed from outside)
const CUBE_INDICES = [
  0, 1, 2, 0, 2, 3,   // bottom
  4, 6, 5, 4, 7, 6,   // top
  0, 4, 5, 0, 5, 1,   // back
  2, 6, 7, 2, 7, 3,   // front
  0, 3, 7, 0, 7, 4,   // left
  1, 5, 6, 1, 6, 2,   // right
];

interface VoxelGridMeshProps {
  voxels: VoxelGrid;
  materialPreset?: MaterialId;
  onPointerEnter: (e: THREE.Event) => void;
  onPointerMove: (e: THREE.Event) => void;
  onPointerLeave: () => void;
  onClick: (e: THREE.Event) => void;
  onPointerDown?: (e: THREE.Event) => void;
}

export function VoxelGridMesh({
  voxels,
  materialPreset = "concrete",
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onClick,
  onPointerDown,
}: VoxelGridMeshProps) {
  const { roughness, metalness } = getMaterialPreset(materialPreset);
  const { positions, colors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];
    const tempColor = new THREE.Color();

    voxels.forEach((data, k) => {
      const [x, y, z] = parseKey(k);
      const cx = x + 0.5;
      const cy = y + 0.5 + VOXEL_GRID_CLEARANCE;
      const cz = z + 0.5;
      tempColor.set(data.color);
      for (let i = 0; i < 8; i++) {
        const [vx, vy, vz] = CUBE_CORNERS[i];
        positions.push(cx + vx, cy + vy, cz + vz);
        colors.push(tempColor.r, tempColor.g, tempColor.b);
      }
    });

    return { positions, colors };
  }, [voxels]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    const indices: number[] = [];
    const n = positions.length / 3;
    for (let i = 0; i < n; i += 8) {
      for (const idx of CUBE_INDICES) indices.push(i + idx);
    }
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [positions, colors]);

  if (positions.length === 0) return null;

  return (
    <group>
      <mesh
        geometry={geometry}
        onPointerEnter={onPointerEnter}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onPointerDown={onPointerDown}
        onClick={onClick}
      >
        <meshStandardMaterial
          vertexColors
          flatShading={false}
          roughness={roughness}
          metalness={metalness}
        />
      </mesh>
    </group>
  );
}
