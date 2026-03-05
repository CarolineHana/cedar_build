/**
 * Building material presets: palettes (colors) and mesh finish (roughness/metalness).
 * Used to recolor the whole building and to style the voxel mesh.
 */

export type MaterialId = "wood" | "steel" | "concrete" | "brick";

export interface MaterialPreset {
  id: MaterialId;
  name: string;
  palette: string[];
  roughness: number;
  metalness: number;
}

export const MATERIAL_PRESETS: MaterialPreset[] = [
  {
    id: "wood",
    name: "Wood",
    palette: ["#c4a574", "#8b6914", "#5c4a1a", "#3d2f14"],
    roughness: 0.82,
    metalness: 0.04,
  },
  {
    id: "steel",
    name: "Steel",
    palette: ["#b8c4ce", "#7d8a94", "#4a5560", "#2d3439"],
    roughness: 0.28,
    metalness: 0.88,
  },
  {
    id: "concrete",
    name: "Concrete",
    palette: ["#e8e6e3", "#9c9992", "#5c5853"],
    roughness: 0.72,
    metalness: 0.06,
  },
  {
    id: "brick",
    name: "Brick",
    palette: ["#b55239", "#8b3a2a", "#6b2c20", "#4a1e18"],
    roughness: 0.78,
    metalness: 0.02,
  },
];

const presetById = new Map<MaterialId, MaterialPreset>(
  MATERIAL_PRESETS.map((p) => [p.id, p])
);

export function getMaterialPreset(id: MaterialId): MaterialPreset {
  const p = presetById.get(id);
  if (!p) return MATERIAL_PRESETS[2]; // concrete fallback
  return p;
}

export function getPaletteForMaterial(id: MaterialId): string[] {
  return getMaterialPreset(id).palette;
}
