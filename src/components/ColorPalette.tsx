"use client";

import { DEFAULT_PALETTE } from "@/lib/constants";

interface ColorPaletteProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

const SWATCH_CLASS =
  "w-7 h-7 rounded border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--text)]/30";

export function ColorPalette({ selectedColor, onSelect }: ColorPaletteProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5 p-2 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
        {DEFAULT_PALETTE.map((color) => {
          const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              className={SWATCH_CLASS}
              style={{
                backgroundColor: color,
                borderColor: isSelected ? "var(--text)" : "transparent",
                boxShadow: isSelected ? "0 0 0 2px var(--bg)" : "none",
              }}
              onClick={() => onSelect(color)}
              title={color}
            />
          );
        })}
      </div>
      <label className="flex items-center gap-1.5 cursor-pointer" title="Pick a custom color to build with">
        <input
          type="color"
          value={selectedColor.startsWith("#") ? selectedColor : `#${selectedColor}`}
          onChange={(e) => onSelect(e.target.value)}
          className="w-8 h-8 rounded border-2 border-[var(--border)] cursor-pointer bg-transparent"
        />
        <span className="text-xs text-[var(--muted)]">Custom</span>
      </label>
    </div>
  );
}
