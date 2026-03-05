// Block palette – 3 neutral tones only
export const DEFAULT_PALETTE = [
  "#e8e6e3", // light warm gray
  "#9c9992", // medium warm gray
  "#5c5853", // dark warm gray
];

export const GRID_SIZE = 32; // max extent in each axis (-16..15 or 0..31)
export const GRID_PLANE_SIZE = 32; // bounded grid width/depth in world units
export const VOXEL_SIZE = 1.08; // slightly larger so cubes read clearly
export const VOXEL_GRID_CLEARANCE = 0.2; // cubes sit fully above the grid plane (no intersection)
