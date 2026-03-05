"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { VoxelCanvas } from "@/components/VoxelCanvas";
import { ColorPalette } from "@/components/ColorPalette";
import { FreeDrawModal } from "@/components/FreeDrawModal";
import type { VoxelGrid, VoxelKey, VoxelData } from "@/types/voxel";
import { parseKey, key as makeKey } from "@/types/voxel";
import { DEFAULT_PALETTE, GRID_SIZE } from "@/lib/constants";
import { CATALOGUE_BUILDINGS, buildingToVoxelGrid } from "@/lib/catalogue";
import {
  MATERIAL_PRESETS,
  getPaletteForMaterial,
  type MaterialId,
} from "@/lib/materials";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type RedoItem = { key: VoxelKey; color: string };
/** One undo step: a single placed key or a batch (e.g. free-draw). */
type UndoEntry = VoxelKey | VoxelKey[];
type RedoEntry = RedoItem | RedoItem[];

// -----------------------------------------------------------------------------
// Shared styles
// -----------------------------------------------------------------------------

const HEADER_BTN =
  "px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors";

const DROPDOWN_ITEM =
  "w-full px-4 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--border)]/30 transition-colors";

const SECTION_LABEL = "text-xs font-medium text-[var(--muted)] uppercase tracking-wider";

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------

export default function Home() {
  // ---- State ----
  const [voxels, setVoxels] = useState<VoxelGrid>(new Map());
  const [selectedColor, setSelectedColor] = useState(DEFAULT_PALETTE[0]);
  const [material, setMaterial] = useState<MaterialId>("concrete");
  const [placementHistory, setPlacementHistory] = useState<UndoEntry[]>([]);
  const [redoHistory, setRedoHistory] = useState<RedoEntry[]>([]);
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [freeDrawOpen, setFreeDrawOpen] = useState(false);
  const catalogueRef = useRef<HTMLDivElement>(null);
  const materialRef = useRef<HTMLDivElement>(null);

  // ---- Close dropdowns on outside click ----
  useEffect(() => {
    if (!catalogueOpen && !materialOpen) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (catalogueOpen && catalogueRef.current && !catalogueRef.current.contains(target)) {
        setCatalogueOpen(false);
      }
      if (materialOpen && materialRef.current && !materialRef.current.contains(target)) {
        setMaterialOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [catalogueOpen, materialOpen]);

  const handleBlockPlaced = useCallback((key: VoxelKey) => {
    setPlacementHistory((prev) => [...prev, key]);
    setRedoHistory([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (placementHistory.length === 0) return;
    const last = placementHistory[placementHistory.length - 1];
    const keys = Array.isArray(last) ? last : [last];
    const redoItems: RedoItem[] = keys
      .map((k) => {
        const data = voxels.get(k);
        return data ? { key: k, color: data.color } : null;
      })
      .filter((r): r is RedoItem => r !== null);
    if (redoItems.length === 0) return;
    setPlacementHistory((prev) => prev.slice(0, -1));
    setRedoHistory((prev) => [...prev, redoItems.length === 1 ? redoItems[0] : redoItems]);
    setVoxels((prev) => {
      const next = new Map(prev);
      keys.forEach((k) => next.delete(k));
      return next;
    });
  }, [placementHistory.length, voxels]);

  const handleRedo = useCallback(() => {
    if (redoHistory.length === 0) return;
    const last = redoHistory[redoHistory.length - 1];
    const items = Array.isArray(last) ? last : [last];
    setRedoHistory((prev) => prev.slice(0, -1));
    setPlacementHistory((prev) => [...prev, items.length === 1 ? items[0].key : items.map((i) => i.key)]);
    setVoxels((prev) => {
      const next = new Map(prev);
      items.forEach(({ key: k, color }) => next.set(k, { color }));
      return next;
    });
  }, [redoHistory.length]);

  const handleClear = useCallback(() => {
    setVoxels(new Map());
    setPlacementHistory([]);
    setRedoHistory([]);
  }, []);

  // ---- Derived & content handlers ----
  const paletteForMaterial = getPaletteForMaterial(material);

  const handleMaterialChange = useCallback((id: MaterialId) => {
    setMaterial(id);
    setMaterialOpen(false);
    setVoxels((prev) => {
      if (prev.size === 0) return prev;
      const pal = getPaletteForMaterial(id);
      if (pal.length === 0) return prev;
      const next = new Map<VoxelKey, VoxelData>();
      prev.forEach((data, k) => {
        const [, y] = parseKey(k);
        const color = pal[Math.floor(y) % pal.length];
        next.set(k, { color });
      });
      return next;
    });
  }, []);

  const handleFreeDrawGenerate = useCallback(
    (pixels: boolean[][]) => {
      if (!pixels.length || !pixels[0].length) return;
      const width = pixels[0].length;
      const height = pixels.length;
      // Front-facing: row 0 = top of drawing, row (height-1) = ground
      const offsetX = Math.floor((GRID_SIZE - width) / 2);
      const depth = 4; // extrude front view into 4 blocks deep
      const color = selectedColor;
      const grid: VoxelGrid = new Map();

      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          if (!pixels[row][col]) continue;
          const gx = offsetX + col;
          const gy = height - 1 - row; // drawing top = high y, bottom = ground
          if (gx < 0 || gx >= GRID_SIZE || gy < 0 || gy >= GRID_SIZE) continue;
          for (let gz = 0; gz < depth; gz++) {
            grid.set(makeKey(gx, gy, gz), { color });
          }
        }
      }

      const allKeys = Array.from(grid.keys());
      setVoxels(grid);
      setPlacementHistory(allKeys.length > 0 ? [allKeys] : []);
      setRedoHistory([]);
    },
    [selectedColor]
  );

  const handleSurpriseMe = useCallback(() => {
    if (CATALOGUE_BUILDINGS.length === 0) return;
    const random =
      CATALOGUE_BUILDINGS[Math.floor(Math.random() * CATALOGUE_BUILDINGS.length)];
    const grid = buildingToVoxelGrid(random, paletteForMaterial);
    setVoxels(grid);
    setPlacementHistory([]);
    setRedoHistory([]);
  }, [paletteForMaterial]);

  const handlePickFromCatalogue = useCallback((buildingId: string | null) => {
    if (buildingId === null) {
      setVoxels(new Map());
      setPlacementHistory([]);
      setRedoHistory([]);
      setCatalogueOpen(false);
      return;
    }
    const building = CATALOGUE_BUILDINGS.find((b) => b.id === buildingId);
    if (!building) return;
    const grid = buildingToVoxelGrid(building, paletteForMaterial);
    setVoxels(grid);
    setPlacementHistory([]);
    setRedoHistory([]);
    setCatalogueOpen(false);
  }, [paletteForMaterial]);

  // ---- Render ----
  return (
    <main className="h-screen flex flex-col overflow-hidden">
      <header className="shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
        <div className="px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--text)] mr-2">
            Cedar Voxel
          </h1>

          <div className="flex items-center gap-1 border-r border-[var(--border)] pr-4">
            <span className={`${SECTION_LABEL} mr-2`}>Edit</span>
            <button type="button" onClick={handleUndo} disabled={placementHistory.length === 0} className={HEADER_BTN}>
              Undo
            </button>
            <button type="button" onClick={handleRedo} disabled={redoHistory.length === 0} className={HEADER_BTN}>
              Redo
            </button>
            <button type="button" onClick={handleClear} disabled={voxels.size === 0} className={HEADER_BTN}>
              Clear
            </button>
          </div>

          <div className="flex items-center gap-1 border-r border-[var(--border)] pr-4">
            <span className={`${SECTION_LABEL} mr-2`}>Content</span>
            <button type="button" onClick={handleSurpriseMe} className={HEADER_BTN}>
              Surprise me
            </button>
            <button type="button" onClick={() => setFreeDrawOpen(true)} className={HEADER_BTN}>
              Free draw
            </button>
            <div className="relative" ref={catalogueRef}>
              <button type="button" onClick={() => setCatalogueOpen((o) => !o)} className={HEADER_BTN}>
                Catalogue
              </button>
              {catalogueOpen && (
                <div className="absolute top-full left-0 mt-1 py-1 min-w-[200px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50 max-h-[70vh] overflow-y-auto">
                  <button
                    type="button"
                    onClick={() => handlePickFromCatalogue(null)}
                    className={`${DROPDOWN_ITEM} text-[var(--muted)] rounded-t-lg border-b border-[var(--border)]`}
                  >
                    None
                  </button>
                  {CATALOGUE_BUILDINGS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handlePickFromCatalogue(b.id)}
                      className={`${DROPDOWN_ITEM} last:rounded-b-lg`}
                    >
                      {b.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 border-r border-[var(--border)] pr-4">
            <span className={SECTION_LABEL}>Material</span>
            <div className="relative" ref={materialRef}>
              <button type="button" onClick={() => setMaterialOpen((o) => !o)} className={HEADER_BTN}>
                {MATERIAL_PRESETS.find((m) => m.id === material)?.name ?? "Concrete"}
              </button>
              {materialOpen && (
                <div className="absolute top-full right-0 mt-1 py-1 min-w-[160px] rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-lg z-50">
                  {MATERIAL_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleMaterialChange(preset.id)}
                      className={`${DROPDOWN_ITEM} first:rounded-t-lg last:rounded-b-lg flex items-center gap-2`}
                    >
                      <span
                        className="w-4 h-4 rounded border border-[var(--border)] shrink-0"
                        style={{
                          background:
                            preset.palette.length > 0
                              ? `linear-gradient(135deg, ${preset.palette[0]} 50%, ${preset.palette[preset.palette.length - 1]} 50%)`
                              : "var(--muted)",
                        }}
                      />
                      {preset.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={SECTION_LABEL}>Color</span>
            <ColorPalette selectedColor={selectedColor} onSelect={setSelectedColor} />
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col">
        <div className="flex-1 min-h-0 bg-[var(--surface)]">
          <VoxelCanvas
            voxels={voxels}
            setVoxels={setVoxels}
            selectedColor={selectedColor}
            material={material}
            paletteForMaterial={paletteForMaterial}
            onBlockPlaced={handleBlockPlaced}
          />
        </div>
        <p className="shrink-0 px-6 py-2 text-sm text-[var(--muted)] bg-[var(--surface)] border-t border-[var(--border)]">
          Drag to rotate · Scroll to zoom · Right-drag or two-finger drag to pan
        </p>
      </div>
      <FreeDrawModal
        open={freeDrawOpen}
        onClose={() => setFreeDrawOpen(false)}
        onGenerate={handleFreeDrawGenerate}
      />
    </main>
  );
}
