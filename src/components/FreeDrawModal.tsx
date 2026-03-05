"use client";

import { useState, useEffect, useMemo } from "react";

// -----------------------------------------------------------------------------
// Types & constants
// -----------------------------------------------------------------------------

interface FreeDrawModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (pixels: boolean[][]) => void;
}

const DRAW_GRID_SIZE = 16;

const BTN_SECONDARY =
  "px-3 py-1.5 text-xs font-medium rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/20 transition-colors";

const BTN_PRIMARY =
  "px-4 py-1.5 text-xs font-semibold rounded-lg bg-[var(--text)] text-[var(--surface)] hover:bg-[var(--text)]/90 transition-colors";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function FreeDrawModal({ open, onClose, onGenerate }: FreeDrawModalProps) {
  const emptyPixels = useMemo(
    () =>
      Array.from({ length: DRAW_GRID_SIZE }, () =>
        Array.from({ length: DRAW_GRID_SIZE }, () => false)
      ),
    []
  );

  const [pixels, setPixels] = useState<boolean[][]>(emptyPixels);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawValue, setDrawValue] = useState(true);

  useEffect(() => {
    if (!open) return;
    const handleUp = () => setIsDrawing(false);
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPixels(emptyPixels);
      setIsDrawing(false);
    }
  }, [open, emptyPixels]);

  if (!open) return null;

  const updatePixel = (x: number, y: number, value: boolean) => {
    setPixels((prev) => {
      if (prev[y][x] === value) return prev;
      const next = prev.map((row) => row.slice());
      next[y][x] = value;
      return next;
    });
  };

  const handleMouseDown = (x: number, y: number) => {
    setIsDrawing(true);
    setDrawValue(!pixels[y][x] || true);
    updatePixel(x, y, !pixels[y][x]);
  };

  const handleMouseEnter = (x: number, y: number) => {
    if (!isDrawing) return;
    updatePixel(x, y, drawValue);
  };

  const handleGenerate = () => {
    onGenerate(pixels);
    onClose();
  };

  const handleClear = () => {
    setPixels(emptyPixels);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-[var(--text)]">Free draw</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--border)]/40 transition-colors"
            aria-label="Close free draw"
          >
            ×
          </button>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Draw a front-facing silhouette (ground at bottom). Generate converts it into
          blocks on the grid.
        </p>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
          <div
            className="grid gap-[1px] bg-[var(--border)] select-none"
            style={{ gridTemplateColumns: `repeat(${DRAW_GRID_SIZE}, minmax(0, 1fr))` }}
            onMouseLeave={() => setIsDrawing(false)}
          >
            {pixels.map((row, y) =>
              row.map((filled, x) => (
                <button
                  key={`${x}-${y}`}
                  type="button"
                  className={`aspect-square border-0 p-0 ${
                    filled ? "bg-[var(--text)]" : "bg-[var(--surface)]"
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleMouseDown(x, y);
                  }}
                  onMouseEnter={() => handleMouseEnter(x, y)}
                />
              ))
            )}
          </div>
        </div>
        <div className="flex items-center justify-between pt-1">
          <button type="button" onClick={handleClear} className={BTN_SECONDARY}>
            Clear
          </button>
          <button type="button" onClick={handleGenerate} className={BTN_PRIMARY}>
            Generate
          </button>
        </div>
      </div>
    </div>
  );
}

