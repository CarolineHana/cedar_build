export type VoxelKey = string; // "x,y,z"

export interface VoxelData {
  color: string; // hex
}

export type VoxelGrid = Map<VoxelKey, VoxelData>;

export function key(x: number, y: number, z: number): VoxelKey {
  return `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
}

export function parseKey(k: VoxelKey): [number, number, number] {
  const [x, y, z] = k.split(",").map(Number);
  return [x, y, z];
}
