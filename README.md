# Cedar Voxel

A browser-based voxel editor for building in 3D. Place colored blocks on a grid, load premade buildings, or draw a silhouette and generate blocks—all with different materials (wood, steel, concrete, brick). Built with **TypeScript**, **Next.js**, and **Three.js** (React Three Fiber).

## Features

- **Place blocks** — Click the grid or existing blocks to add voxels in your selected color. A ghost preview shows where the next block will go.
- **3D navigation** — Drag to orbit, scroll to zoom, right-drag or two-finger drag to pan.
- **Color** — Choose from the palette or use the custom color picker; new blocks and free-draw output use the current color.
- **Materials** — Switch the whole scene’s look: **Wood**, **Steel**, **Concrete**, or **Brick**. Each changes color tones and surface finish (roughness/metalness).
- **Catalogue** — Pick from 9 architectural styles: Classical, Gothic, Art Deco, High-tech, Colonial, Modernism, Brutalism, Art Nouveau, Postmodernism. Buildings are high-resolution voxel shapes that replace the current grid.
- **Surprise me** — Load a random building from the catalogue.
- **Free draw** — Open a small canvas, draw a front-facing silhouette (ground at bottom), then **Generate** to turn it into blocks on the grid (extruded in depth, in your selected color). Undo removes the whole drawing in one step.
- **Edit** — **Undo** / **Redo** (per block or per free-draw batch) and **Clear** to remove everything.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** — 3D scene, orbit controls, grid, and voxel mesh

## Project structure

- `src/app/` — Layout and main page (header controls, modals, canvas).
- `src/components/` — **VoxelCanvas** (3D scene, placement), **VoxelGridMesh** (merged voxel geometry), **VoxelPointer** (preview ghost), **ColorPalette**, **FreeDrawModal**.
- `src/lib/` — **catalogue.ts** (building definitions + `buildingToVoxelGrid`), **materials.ts** (material presets and palettes), **constants.ts** (grid size, palette, voxel dimensions).
- `src/types/voxel.ts` — Voxel grid types and key helpers.
