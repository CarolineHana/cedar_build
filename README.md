# Cedar Voxel

A browser-based voxel drawing tool — place and remove colored cubes on a 3D grid. Built with **TypeScript**, **Next.js**, and **Three.js** (via React Three Fiber).

## Features

- **Place & remove blocks** — Click to add a voxel, switch to Remove and click to delete
- **3D navigation** — Orbit (drag), zoom (scroll), pan (right-drag or two-finger drag)
- **Color selection** — Palette of 28 colors plus a custom color picker
- **Live preview** — Semi-transparent ghost of the next block when adding, red outline when removing

## Run locally

Requires **Node.js 18.17+** (or 20+ recommended).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub (or connect your Git provider in Vercel).
2. In [Vercel](https://vercel.com), **Add New Project** and import the repo.
3. Leave build settings as default (Next.js is auto-detected).
4. Deploy. The app is static-friendly; the canvas runs entirely in the client.

No environment variables or server config required for the free tier.

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Three.js** + **@react-three/fiber** + **@react-three/drei** for 3D scene, orbit controls, and grid

## Project structure

- `src/app/` — Next.js app (layout, page, globals)
- `src/components/` — `VoxelCanvas`, `VoxelGridMesh`, `VoxelPointer`, `ColorPalette`
- `src/types/voxel.ts` — Voxel grid types and key helpers
- `src/lib/constants.ts` — Palette and grid constants
