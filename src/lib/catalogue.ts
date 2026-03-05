import type { VoxelGrid } from "@/types/voxel";
import { key } from "@/types/voxel";

/**
 * Catalogue of premade building shapes.
 * Each building returns logical [x, y, z] positions; buildingToVoxelGrid scales them.
 * Y = height (0 = ground), X and Z = horizontal.
 */

export type CatalogueBuilding = {
  id: string;
  name: string;
  /** Returns voxel positions [x, y, z] for each block. */
  getPositions: () => [number, number, number][];
};

function box(
  x0: number,
  y0: number,
  z0: number,
  w: number,
  h: number,
  d: number
): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let x = x0; x < x0 + w; x++)
    for (let y = y0; y < y0 + h; y++)
      for (let z = z0; z < z0 + d; z++) out.push([x, y, z]);
  return out;
}

/** Ellipse approximation: include (x,z) if inside ellipse with radii rx, rz centered at (cx, cz). */
function ellipse(
  cx: number,
  cz: number,
  rx: number,
  rz: number,
  y0: number,
  h: number
): [number, number, number][] {
  const out: [number, number, number][] = [];
  for (let x = cx - rx; x <= cx + rx; x++)
    for (let z = cz - rz; z <= cz + rz; z++)
      if ((x - cx) ** 2 / rx ** 2 + (z - cz) ** 2 / rz ** 2 <= 1.05)
        for (let y = y0; y < y0 + h; y++) out.push([x, y, z]);
  return out;
}

export const CATALOGUE_BUILDINGS: CatalogueBuilding[] = [
  {
    id: "classical",
    name: "Classical",
    getPositions: () => {
      const out: [number, number, number][] = [];
      out.push(...box(0, 0, 0, 14, 1, 10));
      out.push(...box(1, 1, 0, 12, 1, 10));
      out.push(...box(2, 2, 0, 10, 4, 10));
      for (const col of [2, 4, 6, 8, 10]) {
        out.push(...box(col, 2, 0, 1, 5, 1));
        out.push(...box(col, 2, 9, 1, 5, 1));
      }
      out.push(...box(2, 6, 0, 8, 1, 2));
      out.push(...box(2, 6, 8, 8, 1, 2));
      for (let step = 0; step < 4; step++) {
        const w = 6 - step * 2;
        out.push(...box(3 + step, 7 + step, 0, w, 1, 2));
      }
      return out;
    },
  },
  {
    id: "gothic",
    name: "Gothic",
    getPositions: () => {
      const out: [number, number, number][] = [];
      out.push(...box(0, 0, 0, 12, 4, 8));
      out.push(...box(2, 0, 2, 4, 4, 4));
      out.push(...box(0, 4, 0, 4, 6, 3));
      out.push(...box(8, 4, 0, 4, 6, 3));
      out.push(...box(4, 4, 0, 4, 10, 3));
      for (let t = 0; t < 5; t++)
        out.push(...box(5 + t, 10 + t, 0, 2, 1, 2));
      for (let t = 0; t < 4; t++)
        out.push(...box(2 + t, 10 + t, 0, 1, 1, 2));
      for (let t = 0; t < 4; t++)
        out.push(...box(9 - t, 10 + t, 0, 1, 1, 2));
      return out;
    },
  },
  {
    id: "artdeco",
    name: "Art Deco",
    getPositions: () => {
      const out: [number, number, number][] = [];
      const tiers = [
        [0, 0, 0, 10, 2, 8],
        [1, 2, 1, 8, 2, 6],
        [2, 4, 2, 6, 2, 4],
        [3, 6, 3, 4, 2, 2],
        [4, 8, 3, 2, 2, 2],
        [4, 10, 3, 2, 2, 2],
        [5, 12, 3, 1, 4, 1],
      ];
      for (const [x, y, z, w, h, d] of tiers) out.push(...box(x, y, z, w, h, d));
      return out;
    },
  },
  {
    id: "hightech",
    name: "High-tech",
    getPositions: () => {
      const out: [number, number, number][] = [];
      out.push(...box(1, 0, 0, 12, 1, 8));
      for (let band = 0; band < 6; band++) {
        out.push(...ellipse(6, 4, 4, 3, 1 + band * 2, 1));
      }
      return out;
    },
  },
  {
    id: "colonial",
    name: "Colonial",
    getPositions: () => {
      const out: [number, number, number][] = [];
      // Plinth and main two-storey volume with a slight setback.
      out.push(...box(0, 0, 0, 14, 1, 6));
      out.push(...box(0, 1, 1, 14, 2, 5));
      out.push(...box(0, 3, 1, 14, 2, 5));
      // Cornice and low parapet.
      out.push(...box(0, 5, 0, 14, 1, 6));
      out.push(...box(0, 6, 1, 14, 1, 4));
      // Repetitive bays along the front facade.
      const bays = [1, 3, 5, 7, 9, 11, 13];
      for (const x of bays) {
        out.push(...box(x, 1, 0, 1, 2, 1));
        out.push(...box(x, 3, 0, 1, 2, 1));
      }
      // Small central pediment.
      out.push(...box(5, 6, 0, 4, 1, 2));
      return out;
    },
  },
  {
    id: "modernism",
    name: "Modernism",
    getPositions: () => {
      const out: [number, number, number][] = [];
      const supports = [1, 4, 7, 10, 13];
      for (const px of supports) {
        out.push(...box(px, 0, 1, 1, 3, 1));
        out.push(...box(px, 0, 5, 1, 2, 1));
      }
      // Thin deck and bench-like volume above the pilotis.
      out.push(...box(0, 3, 0, 14, 1, 7));
      out.push(...box(1, 4, 1, 12, 1, 5));
      // Raised backrest band.
      out.push(...box(1, 5, 5, 12, 2, 1));
      return out;
    },
  },
  {
    id: "brutalism",
    name: "Brutalism",
    getPositions: () => {
      const out: [number, number, number][] = [];
      // Two heavy side blocks.
      out.push(...box(0, 0, 0, 5, 8, 6));
      out.push(...box(9, 0, 0, 5, 8, 6));
      // Tall central tower.
      out.push(...box(5, 0, 2, 4, 12, 4));
      // Bridging volume and rooftop masses.
      out.push(...box(2, 8, 1, 11, 2, 4));
      out.push(...box(2, 10, 2, 2, 2, 2));
      out.push(...box(10, 10, 2, 2, 2, 2));
      return out;
    },
  },
  {
    id: "artnouveau",
    name: "Art Nouveau",
    getPositions: () => {
      const out: [number, number, number][] = [];
      // Asymmetric main mass with flowing stepped roofline.
      out.push(...box(0, 0, 0, 9, 3, 6));
      out.push(...box(1, 3, 0, 7, 1, 6));
      out.push(...box(2, 4, 0, 5, 1, 6));
      out.push(...box(3, 5, 0, 3, 1, 6));
      // Taller side volume.
      out.push(...box(6, 0, 0, 4, 5, 4));
      out.push(...box(7, 5, 0, 2, 2, 3));
      // Slender tower with a small cross.
      out.push(...box(1, 3, 2, 1, 4, 2));
      out.push(...box(0, 7, 2, 3, 1, 1));
      out.push(...box(1, 6, 2, 1, 2, 1));
      return out;
    },
  },
  {
    id: "postmodernism",
    name: "Postmodernism",
    getPositions: () => {
      const out: [number, number, number][] = [];
      out.push(...box(0, 0, 0, 12, 6, 8));
      for (let seg = 0; seg < 6; seg++) {
        out.push(...box(seg * 2, 0, 0, 1, 6, 8));
      }
      // Split top frame suggesting a notched pediment.
      out.push(...box(0, 6, 0, 4, 1, 8));
      out.push(...box(6, 6, 0, 6, 1, 8));
      out.push(...box(4, 6, 0, 2, 1, 2));
      out.push(...box(4, 6, 6, 2, 1, 2));
      // Central tower rising from the notch and side frames.
      out.push(...box(4, 7, 2, 4, 3, 4));
      out.push(...box(0, 6, 0, 1, 3, 8));
      out.push(...box(11, 6, 0, 1, 3, 8));
      return out;
    },
  },
];

/** Resolution scale: each logical voxel becomes scale³ blocks for higher detail. */
export const CATALOGUE_RESOLUTION_SCALE = 2;

/** Convert a catalogue building into a VoxelGrid using the given palette. */
export function buildingToVoxelGrid(
  building: CatalogueBuilding,
  palette: string[],
  scale: number = CATALOGUE_RESOLUTION_SCALE
): VoxelGrid {
  const grid: VoxelGrid = new Map();
  const positions = building.getPositions();
  for (const [lx, ly, lz] of positions) {
    const color = palette[ly % palette.length];
    for (let dx = 0; dx < scale; dx++)
      for (let dy = 0; dy < scale; dy++)
        for (let dz = 0; dz < scale; dz++) {
          const x = lx * scale + dx;
          const y = ly * scale + dy;
          const z = lz * scale + dz;
          grid.set(key(x, y, z), { color });
        }
  }
  return grid;
}
